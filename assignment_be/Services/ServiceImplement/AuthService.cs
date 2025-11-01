using DTOs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Repository.IRepository;
using Repository.Models;
using Services.IService;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Services.ServiceImplement
{
    public class AuthService : IAuthService
    {
        private readonly ISystemAccountRepository _accountRepository;
        private readonly IConfiguration _configuration;
        private readonly AdminAccountOptions _adminAccount;

        public AuthService(ISystemAccountRepository accountRepository, IConfiguration configuration, IOptions<AdminAccountOptions> adminAccountOptions)
        {
            _accountRepository = accountRepository;
            _configuration = configuration;
            _adminAccount = adminAccountOptions.Value;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto loginRequest)
        {
            var token = "";

            if (_adminAccount.AccountEmail.Equals(loginRequest.Email) && _adminAccount.AccountPassword.Equals(loginRequest.Password))
            {
                token = GenerateJwtTokenAdmin(_adminAccount);

                return new LoginResponseDto
                {
                    Token = token,
                    Email = _adminAccount.AccountEmail,
                    AccountName = _adminAccount.AccountName,
                    Role = _adminAccount.AccountRole
                };
            }

            var account = await _accountRepository.GetByEmailAsync(loginRequest.Email);

            if (account == null || !account.IsActive)
            {
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");
            }

             token = GenerateJwtToken(account);

            return new LoginResponseDto
            {
                Token = token,
                Email = account.AccountEmail,
                AccountName = account.AccountName,
                Role = account.AccountRole
            };
        }

        private string GenerateJwtToken(SystemAccount account)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, account.AccountId.ToString()),
                    new Claim(ClaimTypes.Email, account.AccountEmail),
                    new Claim(ClaimTypes.Name, account.AccountName),
                    new Claim(ClaimTypes.Role, account.AccountRole.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string GenerateJwtTokenAdmin(AdminAccountOptions account)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, account.AccountId.ToString()),
                    new Claim(ClaimTypes.Email, account.AccountEmail),
                    new Claim(ClaimTypes.Name, account.AccountName),
                    new Claim(ClaimTypes.Role, account.AccountRole.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}