using Repository.IRepository;
using Repository.Models;
using Services.IService;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI;

namespace Services.ServiceImplement
{
    public class SystemAccountService : ISystemAccountService
    {
        private readonly ISystemAccountRepository _repo;

        public SystemAccountService(ISystemAccountRepository systemAccountRepository)
        {
            _repo = systemAccountRepository;
        }

        private AccountDto MapToDto(SystemAccount model)
        {
            return new AccountDto
            {
                AccountId = model.AccountId,
                AccountName = model.AccountName,
                AccountEmail = model.AccountEmail,
                AccountRole = model.AccountRole,
                IsActive = model.IsActive
            };
        }

        public async Task<AccountDto> CreateAccountAsync(AccountDto accountDto)
        {
            var existing = await _repo.GetByEmailAsync(accountDto.AccountEmail);
            if (existing != null)
            {
                throw new ArgumentException("Email này đã được sử dụng.");
            }

            if (string.IsNullOrWhiteSpace(accountDto.AccountPassword))
            {
                throw new ArgumentException("Mật khẩu là bắt buộc khi tạo tài khoản.");
            }
            var hashedPassword = accountDto.AccountPassword;

            var accountModel = new SystemAccount
            {
                AccountName = accountDto.AccountName,
                AccountEmail = accountDto.AccountEmail,
                AccountRole = accountDto.AccountRole,
                IsActive = accountDto.IsActive,
                AccountPassword = hashedPassword
            };

            var createdModel = await _repo.CreateAsync(accountModel);

            return MapToDto(createdModel);
        }

        public async Task DeleteAccountAsync(int id)
        {
            var account = await _repo.GetByIdAsync(id);
            if (account == null)
            {
                throw new KeyNotFoundException("Không tìm thấy tài khoản.");
            }

            if (account.AccountRole == 0) 
            {
                throw new InvalidOperationException("Không thể xóa tài khoản Admin.");
            }

            if (account.NewsArticleCreatedBies != null && account.NewsArticleCreatedBies.Any())
            {
                throw new InvalidOperationException("Không thể xóa tài khoản vì tài khoản này đã tạo bài viết.");
            }

            await _repo.DeleteAsync(account);
        }

        public async Task<IEnumerable<AccountDto>> GetAllSystemAccountsAsync()
        {
            var models = await _repo.GetAllAsync();

            var dtos = new List<AccountDto>();
            foreach (var model in models)
            {
                dtos.Add(MapToDto(model));
            }
            return dtos;
        }

        public async Task<AccountDto> GetAccountByIdAsync(int id)
        {
            var model = await _repo.GetByIdAsync(id);
            if (model == null)
            {
                throw new KeyNotFoundException("Không tìm thấy tài khoản.");
            }
            return MapToDto(model);
        }

        public async Task<AccountDto> UpdateAccountAsync(int id, AccountDto accountDto)
        {
            var account = await _repo.GetByIdAsync(id);

            if (account == null)
            {
                throw new KeyNotFoundException("Không tìm thấy tài khoản.");
            }

            if (account.AccountEmail != accountDto.AccountEmail)
            {
                var existingEmail = await _repo.GetByEmailAsync(accountDto.AccountEmail);
                if (existingEmail != null && existingEmail.AccountId != id)
                {
                    throw new ArgumentException("Email này đã được sử dụng.");
                }
            }

            account.AccountName = accountDto.AccountName;
            account.AccountEmail = accountDto.AccountEmail;
            account.AccountRole = accountDto.AccountRole;
            account.IsActive = accountDto.IsActive;

            if (!string.IsNullOrWhiteSpace(accountDto.AccountPassword))
            {
                account.AccountPassword = accountDto.AccountPassword;
            }

            await _repo.UpdateAsync(account);

            return MapToDto(account);
        }

    }
}