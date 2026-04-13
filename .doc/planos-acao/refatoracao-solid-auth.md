# Plano de Ação: Refatoração SOLID da Autenticação

Nosso `AuthService` desenvolveu o clássico *Code Smell* chamado "God Class" (Classe Deus). Atualmente, ele está abraçando o banco the dados de usuários, o banco the OTPs, gerando Tokens Criptográficos e ainda atuando como carteiro mandando e-mails! Isso fere o Princípio da Responsabilidade Única (SRP) do SOLID.

Para organizarmos a casa e facilitar a manutenção, essa é a fragmentação que proponho:

## 1. `EmailNotificationService` 📧
Uma classe focada estritamente em se comunicar com APIs externas ou SMTP.
- **Responsabilidade**: Receber um E-mail de destino, um assundo e corpo predefinido/template e performar o envio encapsulando o clássico `try/catch`. 

## 2. `JwtTokenService` 🎫
Uma classe utilitária puramente focada em tokens.
- **Responsabilidade**: Carregar a `@Value("${jwt.secret}")` das configurações e apenas embalar os claims do usuário para devolver as Strings the Token válidas.

## 3. `OtpService` ⏳
A classe encarregada de administrar os códigos descartáveis.
- **Responsabilidade**: Irá se interligar com o `OtpRepository`. Vai gerar o 6 dígitos the forma randômica The fato, irá salver via `otpRepository.save()` e injetar a o `EmailNotificationService` mandando ele despachar a mensagem. Ele fará a verificação the data the validade e o delete do TTL local.

## 4. O Novo Limpo `AuthService` 🔐
Ele virará um "Maestro" ou Fachada. Perderá injeções the repositórios que não lhe importam e manterá três injeções limpas: `UserRepository`, `OtpService` e `JwtTokenService`.
A sua assinatura de métodos ficará elegante e simples a nível the leitura sem lixos the Try/Catches SMTP ou gerações criptográficas the Strings. Suas linhas vão cair pela metade!
