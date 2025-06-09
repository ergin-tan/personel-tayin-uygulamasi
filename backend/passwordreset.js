const bcrypt = require('bcrypt');

async function main() {
  const password = 'admin';  // Örnek şifre

  // Şifreyi hashle (cost 10)
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hashlenmiş şifre:', hashedPassword);

  // Girişte şifreyi doğrula
  const inputPassword = 'admin'; // Kullanıcıdan gelen şifre
  const isMatch = await bcrypt.compare(inputPassword, hashedPassword);

  if (isMatch) {
    console.log('Şifre doğru! Giriş başarılı.');
  } else {
    console.log('Şifre yanlış! Giriş başarısız.');
  }
}

main().catch(console.error);
