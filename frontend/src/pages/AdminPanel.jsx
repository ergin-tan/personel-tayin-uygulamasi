import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';
import './AdminPanel.css';
import LogViewer from '../components/admin/LogViewer';
import TabNavigation from '../components/admin/TabNavigation';
import PersonelTab from '../components/admin/PersonelTab';
import TayinTab from '../components/admin/TayinTab';
import PersonelModal from '../components/admin/PersonelModal';
import TayinModal from '../components/admin/TayinModal';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatDateForInput } from '../utils/dateUtils';
import { translateTayinTuru, translateDurum, unvanDisplayName } from '../utils/translateUtils';
import { validatePassword } from '../utils/passwordUtils';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('personel');
  const [personelList, setPersonelList] = useState([]);
  const [filteredPersonelList, setFilteredPersonelList] = useState([]);
  const [tayinTalepleriList, setTayinTalepleriList] = useState([]);
  const [filteredTayinTalepleriList, setFilteredTayinTalepleriList] = useState([]);
  const [adliyeler, setAdliyeler] = useState([]);
  const [unvanlar, setUnvanlar] = useState(['yaziislerimuduru', 'zabitkatibi', 'mubasir', 'diger']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  const [personelFilters, setPersonelFilters] = useState({
    adliye: '',
    unvan: '',
    aktif: '',
    searchTerm: '',
    isTypingSearch: false,
    showDeleted: false
  });

  const [tayinFilters, setTayinFilters] = useState({
    durum: '',
    talep_turu: '',
    talep_edilen_adliye: '',
    searchTerm: '',
    isTypingSearch: false,
    showDeleted: false
  });

  const [delayedPersonelSearchTerm, setDelayedPersonelSearchTerm] = useState('');
  const [delayedTayinSearchTerm, setDelayedTayinSearchTerm] = useState('');
  const [personelSearchTimeout, setPersonelSearchTimeout] = useState(null);
  const [tayinSearchTimeout, setTayinSearchTimeout] = useState(null);

  const [showPersonelModal, setShowPersonelModal] = useState(false);
  const [currentPersonel, setCurrentPersonel] = useState(null);
  const [personelForm, setPersonelForm] = useState({
    tc_kimlik_no: '', sicil_no: '', password: '', ad: '', soyad: '',
    email: '', telefon: '', unvan: 'yaziislerimuduru',
    mevcut_adliye_id: '', isAdmin: false, aktif: true,
    ise_baslama_tarihi: '',
    mevcut_gorevde_baslama_tarihi: ''
  });

  const [showTayinModal, setShowTayinModal] = useState(false);
  const [currentTayinTalebi, setCurrentTayinTalebi] = useState(null);
  const [tayinForm, setTayinForm] = useState({
    durum: '',
    karar_aciklamasi: ''
  });

  const tayinDurumlari = ['beklemede', 'inceleme', 'onaylandi', 'reddedildi', 'iptal'];
  const tayinTurleri = ['ogrenim', 'esdurumu', 'saglik', 'diger'];

  const [validationErrors, setValidationErrors] = useState({});
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  const filterPersonel = useCallback(() => {
    const filtered = applyPersonelFilters(personelList, personelFilters);
    setFilteredPersonelList(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personelList, personelFilters, delayedPersonelSearchTerm]);

  const filterTayinTalepleri = useCallback(() => {
    const filtered = applyTayinFilters(tayinTalepleriList, tayinFilters);
    setFilteredTayinTalepleriList(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tayinTalepleriList, tayinFilters, delayedTayinSearchTerm]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [personelRes, tayinTalepleriRes, adliyelerRes] = await Promise.all([
        API.get('/admin/personel', { params: { includeDeleted: 'true' } }),
        API.get('/admin/tayin-talepleri', { params: { includeDeleted: 'true' } }),
        API.get('/adliyeler')
      ]);

      const defaultUnvanlar = ['yaziislerimuduru', 'zabitkatibi', 'mubasir', 'diger'];

      setPersonelList(personelRes.data);
      setTayinTalepleriList(tayinTalepleriRes.data);
      setAdliyeler(adliyelerRes.data);

      try {
        const unvanlarRes = await API.get('/unvanlar');
        if (unvanlarRes.data && Array.isArray(unvanlarRes.data)) {
          setUnvanlar(unvanlarRes.data);
        } else {
          setUnvanlar(defaultUnvanlar);
        }
      } catch (unvanErr) {
        console.log('Unvanlar yüklenirken hata oluştu, varsayılan değerler kullanılıyor:', unvanErr);
        setUnvanlar(defaultUnvanlar);
      }
      
    } catch (err) {
      console.error('Veri yükleme hatası:', err);
      setError('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    console.log("Running filter effect with delayedPersonelSearchTerm:", delayedPersonelSearchTerm);
    filterPersonel();
  }, [filterPersonel, delayedPersonelSearchTerm, personelFilters.adliye, 
      personelFilters.unvan, personelFilters.aktif, personelFilters.showDeleted]);

  useEffect(() => {
    console.log("Running filter effect with delayedTayinSearchTerm:", delayedTayinSearchTerm);
    filterTayinTalepleri();
  }, [filterTayinTalepleri, delayedTayinSearchTerm, tayinFilters.durum, 
      tayinFilters.talep_turu, tayinFilters.talep_edilen_adliye, tayinFilters.showDeleted]);

  useEffect(() => {
    console.log("isTypingSearch for personel changed to:", personelFilters.isTypingSearch);
    
    if (personelSearchTimeout) {
      clearTimeout(personelSearchTimeout);
      setPersonelSearchTimeout(null);
    }
    
    if (personelFilters.isTypingSearch && personelFilters.searchTerm) {
      console.log("Applying existing search term after toggle:", personelFilters.searchTerm);
      setDelayedPersonelSearchTerm(personelFilters.searchTerm);
    } else if (!personelFilters.isTypingSearch) {
      console.log("Real-time search disabled, waiting for manual search");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personelFilters.isTypingSearch]);
  
  useEffect(() => {
    console.log("isTypingSearch for tayin changed to:", tayinFilters.isTypingSearch);
    
    if (tayinSearchTimeout) {
      clearTimeout(tayinSearchTimeout);
      setTayinSearchTimeout(null);
    }
    
    if (tayinFilters.isTypingSearch && tayinFilters.searchTerm) {
      console.log("Applying existing search term after toggle:", tayinFilters.searchTerm);
      setDelayedTayinSearchTerm(tayinFilters.searchTerm);
    } else if (!tayinFilters.isTypingSearch) {
      console.log("Real-time search disabled, waiting for manual search");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tayinFilters.isTypingSearch]);

  useEffect(() => {
    return () => {
      if (personelSearchTimeout) {
        clearTimeout(personelSearchTimeout);
      }
      if (tayinSearchTimeout) {
        clearTimeout(tayinSearchTimeout);
      }
    };
  }, [personelSearchTimeout, tayinSearchTimeout]);

  const toggleShowDeletedPersonel = (e) => {
    const { checked } = e.target;
    
    console.log("Toggling showDeleted for personel to:", checked);
    
    const newFilters = {
      ...personelFilters,
      showDeleted: checked
    };
    
    setPersonelFilters(newFilters);
    
    const filtered = applyPersonelFilters(personelList, newFilters);
    setFilteredPersonelList(filtered);
  };
  
  const toggleShowDeletedTayin = (e) => {
    const { checked } = e.target;
    
    console.log("Toggling showDeleted for tayin to:", checked);
    
    const newFilters = {
      ...tayinFilters,
      showDeleted: checked
    };
    
    setTayinFilters(newFilters);
    
    const filtered = applyTayinFilters(tayinTalepleriList, newFilters);
    setFilteredTayinTalepleriList(filtered);
  };

  const applyPersonelFilters = (personelData, filters) => {
    if (!personelData || !personelData.length) return [];
    console.log("Applying personel filters:", filters);
    console.log("Using delayed search term:", delayedPersonelSearchTerm);
    
    let filtered = [...personelData];
    
    if (!filters.showDeleted) {
      filtered = filtered.filter(p => !p.isdeleted);
    }
    
    if (filters.adliye) {
      filtered = filtered.filter(p => p.mevcut_adliye_id === parseInt(filters.adliye));
    }
    
    if (filters.unvan) {
      filtered = filtered.filter(p => p.unvan === filters.unvan);
    }
    
    if (filters.aktif === 'true') {
      filtered = filtered.filter(p => p.aktif === true);
    } else if (filters.aktif === 'false') {
      filtered = filtered.filter(p => p.aktif === false);
    }
    
    if (delayedPersonelSearchTerm) {
      const searchTerm = delayedPersonelSearchTerm.toLowerCase().trim();
      if (searchTerm) {
        filtered = filtered.filter(p => 
          (p.tc_kimlik_no && p.tc_kimlik_no.toLowerCase().includes(searchTerm)) ||
          (p.sicil_no && p.sicil_no.toLowerCase().includes(searchTerm)) ||
          (p.ad && p.ad.toLowerCase().includes(searchTerm)) ||
          (p.soyad && p.soyad.toLowerCase().includes(searchTerm)) ||
          (`${p.ad} ${p.soyad}`.toLowerCase().includes(searchTerm)) ||
          (p.email && p.email.toLowerCase().includes(searchTerm))
        );
      }
    }
    
    return filtered;
  };

  const applyTayinFilters = (tayinData, filters) => {
    if (!tayinData || !tayinData.length) return [];
    console.log("Applying tayin filters:", filters);
    console.log("Using delayed search term:", delayedTayinSearchTerm);
    
    let filtered = [...tayinData];
    
    if (!filters.showDeleted) {
      filtered = filtered.filter(t => !t.isdeleted);
    }
    
    if (filters.durum) {
      filtered = filtered.filter(t => t.durum === filters.durum);
    }
    
    if (filters.talep_turu) {
      filtered = filtered.filter(t => t.tayin_turu === filters.talep_turu);
    }
    
    if (filters.talep_edilen_adliye) {
      filtered = filtered.filter(t => t.talep_adliye_id === parseInt(filters.talep_edilen_adliye));
    }
    
    if (delayedTayinSearchTerm) {
      const searchTerm = delayedTayinSearchTerm.toLowerCase().trim();
      if (searchTerm) {
        filtered = filtered.filter(t => 
          (t.personel_ad && t.personel_ad.toLowerCase().includes(searchTerm)) ||
          (t.personel_soyad && t.personel_soyad.toLowerCase().includes(searchTerm)) ||
          (`${t.personel_ad} ${t.personel_soyad}`.toLowerCase().includes(searchTerm)) ||
          (t.sicil_no && t.sicil_no.toLowerCase().includes(searchTerm))
        );
      }
    }
    
    return filtered;
  };

  const handlePersonelFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'searchTerm') {
      console.log(`Handling searchTerm change: "${value}", isTypingSearch: ${personelFilters.isTypingSearch}`);
      
      if (personelSearchTimeout) {
        clearTimeout(personelSearchTimeout);
        setPersonelSearchTimeout(null);
      }
      
      setPersonelFilters(prev => ({
        ...prev,
        searchTerm: value
      }));
      
      if (personelFilters.isTypingSearch) {
        console.log("Real-time search active, setting timeout");
        
        if (value.length <= 1 || personelFilters.searchTerm.length <= 1) {
          console.log("First character typed or cleared, applying immediately:", value);
          setDelayedPersonelSearchTerm(value);
        } else {
          const timeoutId = setTimeout(() => {
            console.log("Debounce timeout complete, applying search term:", value);
            setDelayedPersonelSearchTerm(value);
          }, 300);
          setPersonelSearchTimeout(timeoutId);
        }
      }
    } else if (type === 'checkbox' && name !== 'showDeleted') {
      setPersonelFilters(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name !== 'showDeleted') {
      setPersonelFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTayinFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'searchTerm') {
      console.log(`Handling searchTerm change: "${value}", isTypingSearch: ${tayinFilters.isTypingSearch}`);
      
      if (tayinSearchTimeout) {
        clearTimeout(tayinSearchTimeout);
        setTayinSearchTimeout(null);
      }
      
      setTayinFilters(prev => ({
        ...prev,
        searchTerm: value
      }));
      
      if (tayinFilters.isTypingSearch) {
        console.log("Real-time search active, setting timeout");
        
        if (value.length <= 1 || tayinFilters.searchTerm.length <= 1) {
          console.log("First character typed or cleared, applying immediately:", value);
          setDelayedTayinSearchTerm(value);
        } else {
          const timeoutId = setTimeout(() => {
            console.log("Debounce timeout complete, applying search term:", value);
            setDelayedTayinSearchTerm(value);
          }, 300);
          setTayinSearchTimeout(timeoutId);
        }
      }
    } else if (type === 'checkbox' && name !== 'showDeleted') {
      setTayinFilters(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name !== 'showDeleted') {
      setTayinFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const togglePersonelRealtimeSearch = () => {
    const newIsTypingSearch = !personelFilters.isTypingSearch;
    console.log("Toggling real-time search to:", newIsTypingSearch);
    
    setPersonelFilters(prev => ({
      ...prev,
      isTypingSearch: newIsTypingSearch
    }));
    
    if (newIsTypingSearch && personelFilters.searchTerm) {
      console.log("Enabling real-time search with existing term:", personelFilters.searchTerm);
      setDelayedPersonelSearchTerm(personelFilters.searchTerm);
    }
  };

  const toggleTayinRealtimeSearch = () => {
    const newIsTypingSearch = !tayinFilters.isTypingSearch;
    console.log("Toggling real-time search to:", newIsTypingSearch);
    
    setTayinFilters(prev => ({
      ...prev,
      isTypingSearch: newIsTypingSearch
    }));
    
    if (newIsTypingSearch && tayinFilters.searchTerm) {
      console.log("Enabling real-time search with existing term:", tayinFilters.searchTerm);
      setDelayedTayinSearchTerm(tayinFilters.searchTerm);
    }
  };

  const handlePersonelSearch = () => {
    console.log("Manual search button clicked with term:", personelFilters.searchTerm);
    setDelayedPersonelSearchTerm(prev => {
      if (prev === personelFilters.searchTerm) {
        return personelFilters.searchTerm + " ";
      }
      return personelFilters.searchTerm;
    });
  };

  const handleTayinSearch = () => {
    console.log("Manual search button clicked with term:", tayinFilters.searchTerm);
    setDelayedTayinSearchTerm(prev => {
      if (prev === tayinFilters.searchTerm) {
        return tayinFilters.searchTerm + " ";
      }
      return tayinFilters.searchTerm;
    });
  };

  const resetPersonelFilters = () => {
    console.log("Resetting all personel filters");
    setPersonelFilters({
      adliye: '',
      unvan: '',
      aktif: '',
      searchTerm: '',
      isTypingSearch: false,
      showDeleted: false
    });
    
    setDelayedPersonelSearchTerm('');
    
    if (personelSearchTimeout) {
      clearTimeout(personelSearchTimeout);
      setPersonelSearchTimeout(null);
    }
  };

  const resetTayinFilters = () => {
    console.log("Resetting all tayin filters");
    setTayinFilters({
      durum: '',
      talep_turu: '',
      talep_edilen_adliye: '',
      searchTerm: '',
      isTypingSearch: false,
      showDeleted: false
    });
    
    setDelayedTayinSearchTerm('');
    
    if (tayinSearchTimeout) {
      clearTimeout(tayinSearchTimeout);
      setTayinSearchTimeout(null);
    }
  };

  const handlePersonelInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    let errors = { ...validationErrors };
    
    if (name === 'tc_kimlik_no') {
      newValue = value.replace(/[^0-9]/g, '').slice(0, 11);
      
      if (newValue && newValue.length !== 11) {
        errors.tc_kimlik_no = 'TC Kimlik No 11 haneli olmalıdır';
      } else {
        delete errors.tc_kimlik_no;
      }
    }
    
    if (name === 'sicil_no') {
      newValue = value.replace(/[^0-9]/g, '').slice(0, 6);
      
      if (newValue && newValue.length !== 6) {
        errors.sicil_no = 'Sicil No 6 haneli olmalıdır';
      } else {
        delete errors.sicil_no;
      }
    }
    
    if (name === 'telefon') {
      newValue = value.replace(/[^0-9]/g, '').slice(0, 11);
      
      if (newValue && newValue.length !== 11) {
        errors.telefon = 'Telefon numarası 11 haneli olmalıdır';
      } else {
        delete errors.telefon;
      }
    }
    
    setValidationErrors(errors);
    setPersonelForm((prevForm) => ({
      ...prevForm,
      [name]: newValue,
    }));

    if ((name === 'tc_kimlik_no' && newValue.length === 11) || 
        (name === 'sicil_no' && newValue.length === 6)) {
      if (!currentPersonel) {
        checkForDuplicates(name, newValue);
      }
    }
  };

  const checkForDuplicates = async (field, value) => {
    if (!value || isCheckingDuplicates) return;
    
    setIsCheckingDuplicates(true);
    try {
      const response = await API.get(`/admin/personel/check-duplicate?field=${field}&value=${value}`);
      
      if (response.data.exists) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: `Bu ${field === 'tc_kimlik_no' ? 'TC Kimlik No' : 'Sicil No'} sistemde zaten kayıtlı`
        }));
      }
    } catch (error) {
      console.error('Duplicate check error:', error);
      if (error.response?.status === 404) {
        const isDuplicate = personelList.some(p => 
          field === 'tc_kimlik_no' ? 
          p.tc_kimlik_no === value : 
          p.sicil_no === value
        );
        
        if (isDuplicate) {
          setValidationErrors(prev => ({
            ...prev,
            [field]: `Bu ${field === 'tc_kimlik_no' ? 'TC Kimlik No' : 'Sicil No'} sistemde zaten kayıtlı`
          }));
        }
      }
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  const openAddPersonelModal = () => {
    setCurrentPersonel(null);
    setPersonelForm({
      tc_kimlik_no: '', sicil_no: '', password: '', ad: '', soyad: '',
      email: '', telefon: '', unvan: unvanlar[0] || '',
      mevcut_adliye_id: adliyeler.length > 0 ? adliyeler[0].id : '',
      isAdmin: false, aktif: true,
      ise_baslama_tarihi: '',
      mevcut_gorevde_baslama_tarihi: ''
    });
    setShowPersonelModal(true);
  };

  const openEditPersonelModal = (personel) => {
    setCurrentPersonel(personel);
    setPersonelForm({
      tc_kimlik_no: personel.tc_kimlik_no,
      sicil_no: personel.sicil_no,
      password: '',
      ad: personel.ad,
      soyad: personel.soyad,
      email: personel.email || '',
      telefon: personel.telefon || '',
      unvan: personel.unvan,
      mevcut_adliye_id: personel.mevcut_adliye_id,
      isAdmin: personel.isadmin,
      aktif: personel.aktif,
      ise_baslama_tarihi: formatDateForInput(personel.ise_baslama_tarihi),
      mevcut_gorevde_baslama_tarihi: formatDateForInput(personel.mevcut_gorevde_baslama_tarihi)
    });
    setShowPersonelModal(true);
  };

  const closePersonelModal = () => {
    setShowPersonelModal(false);
    setMessage(null);
    setIsError(false);
    setValidationErrors({});
  };

  const handlePersonelSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);
    setLoading(true);

    if (!personelForm.tc_kimlik_no || !personelForm.sicil_no || !personelForm.ad || !personelForm.soyad || !personelForm.mevcut_adliye_id) {
      setMessage('Lütfen tüm zorunlu alanları doldurun.');
      setIsError(true);
      setLoading(false);
      return;
    }

    if (personelForm.tc_kimlik_no.length !== 11 || !/^\d+$/.test(personelForm.tc_kimlik_no)) {
      setValidationErrors(prev => ({
        ...prev,
        tc_kimlik_no: 'TC Kimlik No 11 haneli rakam olmalıdır'
      }));
      setMessage('Lütfen formdaki hataları düzeltin.');
      setIsError(true);
      setLoading(false);
      return;
    }

    if (personelForm.sicil_no.length !== 6 || !/^\d+$/.test(personelForm.sicil_no)) {
      setValidationErrors(prev => ({
        ...prev,
        sicil_no: 'Sicil No 6 haneli rakam olmalıdır'
      }));
      setMessage('Lütfen formdaki hataları düzeltin.');
      setIsError(true);
      setLoading(false);
      return;
    }

    const today = new Date();
    const turkeyTime = new Date(today.getTime() + (3 * 60 * 60 * 1000));
    const todayStr = turkeyTime.toISOString().split('T')[0];
    
    if (personelForm.ise_baslama_tarihi && personelForm.ise_baslama_tarihi > todayStr) {
      setValidationErrors(prev => ({
        ...prev,
        ise_baslama_tarihi: 'İşe başlama tarihi gelecek bir tarih olamaz'
      }));
      setMessage('Lütfen formdaki hataları düzeltin.');
      setIsError(true);
      setLoading(false);
      return;
    }
    
    if (personelForm.mevcut_gorevde_baslama_tarihi && personelForm.mevcut_gorevde_baslama_tarihi > todayStr) {
      setValidationErrors(prev => ({
        ...prev,
        mevcut_gorevde_baslama_tarihi: 'Mevcut görevde başlama tarihi gelecek bir tarih olamaz'
      }));
      setMessage('Lütfen formdaki hataları düzeltin.');
      setIsError(true);
      setLoading(false);
      return;
    }

    if (!currentPersonel && !personelForm.password) {
      setMessage('Yeni personel için şifre zorunludur.');
      setIsError(true);
      setLoading(false);
      return;
    }

    if (personelForm.password) {
      const passwordValidation = validatePassword(personelForm.password);
      if (!passwordValidation.isValid) {
        setMessage(`Şifre gereksinimleri karşılanmıyor: ${passwordValidation.message}`);
        setIsError(true);
        setLoading(false);
        return;
      }
    }

    if (!currentPersonel) {
      const tcKimlikDuplicate = await checkForDuplicates('tc_kimlik_no', personelForm.tc_kimlik_no);
      if (tcKimlikDuplicate) {
        setValidationErrors(prev => ({
          ...prev,
          tc_kimlik_no: 'Bu TC Kimlik No sistemde zaten kayıtlı'
        }));
        setMessage('Lütfen formdaki hataları düzeltin.');
        setIsError(true);
        setLoading(false);
        return;
      }

      const sicilNoDuplicate = await checkForDuplicates('sicil_no', personelForm.sicil_no);
      if (sicilNoDuplicate) {
        setValidationErrors(prev => ({
          ...prev,
          sicil_no: 'Bu Sicil No sistemde zaten kayıtlı'
        }));
        setMessage('Lütfen formdaki hataları düzeltin.');
        setIsError(true);
        setLoading(false);
        return;
      }
    }

    try {
      if (currentPersonel) {
        await API.put(`/admin/personel/${currentPersonel.id}`, personelForm);
        setMessage('Personel başarıyla güncellendi.');
      } else {
        await API.post('/admin/personel', personelForm);
        setMessage('Personel başarıyla eklendi.');
      }
      setIsError(false);
      fetchData();
      closePersonelModal();
    } catch (err) {
      console.error('Personel işlemi hatası:', err);
      if (err.response?.data?.error === 'duplicate_key') {
        const field = err.response?.data?.field;
        if (field === 'tc_kimlik_no') {
          setValidationErrors(prev => ({
            ...prev,
            tc_kimlik_no: 'Bu TC Kimlik No sistemde zaten kayıtlı'
          }));
        } else if (field === 'sicil_no') {
          setValidationErrors(prev => ({
            ...prev,
            sicil_no: 'Bu Sicil No sistemde zaten kayıtlı'
          }));
        }
        setMessage('Lütfen formdaki hataları düzeltin.');
      } else {
        const msg = err.response?.data?.message || 'Bir hata oluştu.';
        setMessage(msg);
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePersonel = async (id) => {
    if (window.confirm('Bu personeli silmek istediğinizden emin misiniz?')) {
      setLoading(true);
      setMessage(null);
      setIsError(false);
      try {
        await API.delete(`/admin/personel/${id}`);
        setMessage('Personel başarıyla silindi.');
        setIsError(false);
        fetchData();
      } catch (err) {
        console.error('Personel silme hatası:', err);
        const msg = err.response?.data?.message || 'Silme işlemi başarısız.';
        setMessage(msg);
        setIsError(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRestorePersonel = async (id) => {
    if (window.confirm('Bu personeli geri yüklemek istediğinizden emin misiniz?')) {
      setLoading(true);
      setMessage(null);
      setIsError(false);
      try {
        await API.put(`/admin/personel/${id}/restore`);
        setMessage('Personel başarıyla geri yüklendi.');
        setIsError(false);
        fetchData();
      } catch (err) {
        console.error('Personel geri yükleme hatası:', err);
        const msg = err.response?.data?.message || 'Geri yükleme işlemi başarısız.';
        setMessage(msg);
        setIsError(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const openEditTayinModal = (talep) => {
    setCurrentTayinTalebi(talep);
    setTayinForm({
      durum: talep.durum,
      karar_aciklamasi: talep.karar_aciklamasi || ''
    });
    setShowTayinModal(true);
  };

  const closeTayinModal = () => {
    setShowTayinModal(false);
    setMessage(null);
    setIsError(false);
  };

  const handleTayinInputChange = (e) => {
    const { name, value } = e.target;
    setTayinForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleTayinSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);
    setLoading(true);

    try {
      await API.put(`/admin/tayin-talepleri/${currentTayinTalebi.id}`, tayinForm);
      setMessage('Tayin talebi başarıyla güncellendi.');
      setIsError(false);
      fetchData();
      closeTayinModal();
    } catch (err) {
      console.error('Tayin talebi işlemi hatası:', err);
      const msg = err.response?.data?.message || 'Bir hata oluştu.';
      setMessage(msg);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTayin = async (id) => {
    if (window.confirm('Bu tayin talebini silmek istediğinizden emin misiniz?')) {
      setLoading(true);
      setMessage(null);
      setIsError(false);
      try {
        await API.delete(`/admin/tayin-talepleri/${id}`);
        setMessage('Tayin talebi başarıyla silindi.');
        setIsError(false);
        fetchData();
      } catch (err) {
        console.error('Tayin talebi silme hatası:', err);
        const msg = err.response?.data?.message || 'Silme işlemi başarısız.';
        setMessage(msg);
        setIsError(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRestoreTayin = async (id) => {
    if (window.confirm('Bu tayin talebini geri yüklemek istediğinizden emin misiniz?')) {
      setLoading(true);
      setMessage(null);
      setIsError(false);
      try {
        await API.put(`/admin/tayin-talepleri/${id}/restore`);
        setMessage('Tayin talebi başarıyla geri yüklendi.');
        setIsError(false);
        fetchData();
      } catch (err) {
        console.error('Tayin talebi geri yükleme hatası:', err);
        const msg = err.response?.data?.message || 'Geri yükleme işlemi başarısız.';
        setMessage(msg);
        setIsError(true);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && personelList.length === 0 && tayinTalepleriList.length === 0 && adliyeler.length === 0) {
      return <div className="loading-message">Yükleniyor...</div>;
  }
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page-container admin-panel-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="card">
        <h2>Admin Paneli</h2>

        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {message && (
          <p className={isError ? 'error-message' : 'success-message'}>
            {message}
          </p>
        )}

        {activeTab === 'personel' && (
          <PersonelTab 
            personelFilters={personelFilters}
            handlePersonelFilterChange={handlePersonelFilterChange}
            resetPersonelFilters={resetPersonelFilters}
            filteredPersonelList={filteredPersonelList}
            personelList={personelList}
            adliyeler={adliyeler}
            unvanlar={unvanlar}
            unvanDisplayName={unvanDisplayName}
            openAddPersonelModal={openAddPersonelModal}
            openEditPersonelModal={openEditPersonelModal}
            handleDeletePersonel={handleDeletePersonel}
            handlePersonelSearch={handlePersonelSearch}
            togglePersonelRealtimeSearch={togglePersonelRealtimeSearch}
            handleRestorePersonel={handleRestorePersonel}
            toggleShowDeletedPersonel={toggleShowDeletedPersonel}
          />
        )}

        {activeTab === 'tayinTalepleri' && (
          <TayinTab 
            tayinFilters={tayinFilters}
            handleTayinFilterChange={handleTayinFilterChange}
            resetTayinFilters={resetTayinFilters}
            filteredTayinTalepleriList={filteredTayinTalepleriList}
            tayinTalepleriList={tayinTalepleriList}
            adliyeler={adliyeler}
            tayinDurumlari={tayinDurumlari}
            tayinTurleri={tayinTurleri}
            translateDurum={translateDurum}
            translateTayinTuru={translateTayinTuru}
            openEditTayinModal={openEditTayinModal}
            handleDeleteTayin={handleDeleteTayin}
            handleTayinSearch={handleTayinSearch}
            toggleTayinRealtimeSearch={toggleTayinRealtimeSearch}
            handleRestoreTayin={handleRestoreTayin}
            toggleShowDeletedTayin={toggleShowDeletedTayin}
          />
        )}

        {activeTab === 'loglar' && (
          <LogViewer />
        )}
      </div>

      <PersonelModal 
        showModal={showPersonelModal}
        currentPersonel={currentPersonel}
        personelForm={personelForm}
        handlePersonelInputChange={handlePersonelInputChange}
        handlePersonelSubmit={handlePersonelSubmit}
        closePersonelModal={closePersonelModal}
        loading={loading}
        adliyeler={adliyeler}
        unvanlar={unvanlar}
        unvanDisplayName={unvanDisplayName}
        validationErrors={validationErrors}
      />

      <TayinModal 
        showModal={showTayinModal}
        currentTayinTalebi={currentTayinTalebi}
        tayinForm={tayinForm}
        handleTayinInputChange={handleTayinInputChange}
        handleTayinSubmit={handleTayinSubmit}
        closeTayinModal={closeTayinModal}
        loading={loading}
        tayinDurumlari={tayinDurumlari}
        translateDurum={translateDurum}
        translateTayinTuru={translateTayinTuru}
      />
    </div>
  );
};

export default AdminPanel;