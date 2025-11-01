using DTOs;
using Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.IService
{
    public interface ITagService
    {
        IQueryable<Tag> GetAllTags();
        Task<IEnumerable<TagDto>> GetAllTagsAsync();
        Task<TagDto> GetTagByIdAsync(int id);
        Task<TagDto> CreateTagAsync(CreateTagDto tagDto);
        Task UpdateTagAsync(int id, CreateTagDto tagDto);
        Task DeleteTagAsync(int id);
        ICollection<TagDto> ToDtoList(ICollection<Tag> tagDto);
    }
}
