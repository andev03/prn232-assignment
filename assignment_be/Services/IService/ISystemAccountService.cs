using Repository.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI;

namespace Services.IService
{
    public interface ISystemAccountService
    {
        Task<IEnumerable<AccountDto>> GetAllSystemAccountsAsync();

        Task<AccountDto> GetAccountByIdAsync(int id);

        Task<AccountDto> CreateAccountAsync(AccountDto accountDto);

        Task<AccountDto> UpdateAccountAsync(int id, AccountDto accountDto);

        Task DeleteAccountAsync(int id);
    }
}