using Microsoft.EntityFrameworkCore;
using Repository.IRepository;
using Repository.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.RepositoryImplement
{
    public class SystemAccountRepository : ISystemAccountRepository
    {
        private readonly FUNewsManagementSystemContext _context;

        public SystemAccountRepository(FUNewsManagementSystemContext context)
        {
            _context = context;
        }

        public async Task<SystemAccount> CreateAsync(SystemAccount account)
        {
            await _context.SystemAccounts.AddAsync(account);
            await _context.SaveChangesAsync();
            return account;
        }

        public async Task DeleteAsync(SystemAccount account)
        {
            _context.SystemAccounts.Remove(account);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.SystemAccounts.AnyAsync(e => e.AccountId == id);
        }

        public async Task<List<SystemAccount>> GetAllAsync()
        {
            return await _context.SystemAccounts.AsNoTracking().ToListAsync();
        }

        public async Task<SystemAccount> GetByEmailAsync(string email)
        {
            return await _context.SystemAccounts
                .FirstOrDefaultAsync(a => a.AccountEmail == email);
        }

        public async Task<SystemAccount> GetByIdAsync(int id)
        {
            return await _context.SystemAccounts
                .Include(atc => atc.NewsArticleCreatedBies)
                .FirstOrDefaultAsync(atc => atc.AccountId == id);
        }

        public async Task UpdateAsync(SystemAccount account)
        {
            _context.Entry(account).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }
    }
}