using Microsoft.EntityFrameworkCore;
using Repository.IRepository;
using Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.RepositoryImplement
{
    public class TagRepository : ITagRepository
    {
        private readonly FUNewsManagementSystemContext _context;

        public TagRepository(FUNewsManagementSystemContext context)
        {
            _context = context;
        }

        public IQueryable<Tag> GetAll()
        {
            return _context.Tags;
        }

        public async Task<Tag> CreateAsync(Tag tag)
        {
            await _context.Tags.AddAsync(tag);
            await _context.SaveChangesAsync();
            return tag;
        }

        public async Task DeleteAsync(int id)
        {
            var tag = await _context.Tags.FindAsync(id);
            if (tag != null)
            {
                _context.Tags.Remove(tag);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Tags.AnyAsync(t => t.TagId == id);
        }

        public async Task<IEnumerable<Tag>> GetAllAsync()
        {
            return await _context.Tags.AsNoTracking().ToListAsync();
        }

        public async Task<Tag> GetByIdAsync(int id)
        {
            return await _context.Tags
                                 .Include(t => t.NewsArticles)
                                 .FirstOrDefaultAsync(t => t.TagId == id);
        }

        public async Task<Tag> GetByNameAsync(string name)
        {
            return await _context.Tags
                                 .FirstOrDefaultAsync(t => t.TagName.ToLower() == name.ToLower());
        }

        public async Task UpdateAsync(Tag tag)
        {
            _context.Entry(tag).State = EntityState.Modified;
            foreach (var article in tag.NewsArticles)
            {
                _context.Entry(article).State = EntityState.Unchanged;
            }
            await _context.SaveChangesAsync();
        }
    }
}
