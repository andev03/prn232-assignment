using Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebAPI;

namespace Repository.IRepository
{
    public interface ISystemAccountRepository
    {
        Task<List<SystemAccount>> GetAllAsync();

        Task<SystemAccount> GetByIdAsync(int id);

        Task<SystemAccount> GetByEmailAsync(string email);

        Task<SystemAccount> CreateAsync(SystemAccount account);

        Task UpdateAsync(SystemAccount account);

        Task DeleteAsync(SystemAccount account);
        Task<bool> ExistsAsync(int id);
    }
}
