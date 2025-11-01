using DTOs;
using Repository.IRepository;
using Repository.Models;
using Services.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.ServiceImplement
{
    public class TagService : ITagService
    {
        private readonly ITagRepository _tagRepository;

        public TagService(ITagRepository tagRepository)
        {
            _tagRepository = tagRepository;
        }

        public IQueryable<Tag> GetAllTags()
        {
            return _tagRepository.GetAll();
        }

        public async Task<TagDto> CreateTagAsync(CreateTagDto tagDto)
        {
            var tagName = tagDto.TagName.Trim().ToLower();

            var existingTag = await _tagRepository.GetByNameAsync(tagName);
            if (existingTag != null)
            {
                throw new ArgumentException($"Tag với tên '{tagDto.TagName}' đã tồn tại.");
            }

            var tag = new Tag { TagName = tagName, Note = tagDto.Note };

            var createdTag = await _tagRepository.CreateAsync(tag);

            return new TagDto { TagId = createdTag.TagId, TagName = createdTag.TagName };
        }

        public async Task DeleteTagAsync(int id)
        {
            var tag = await _tagRepository.GetByIdAsync(id);
            if (tag == null)
            {
                throw new KeyNotFoundException("Không tìm thấy tag.");
            }

            if (tag.NewsArticles.Any())
            {
                throw new InvalidOperationException("Không thể xóa tag này vì đang được sử dụng bởi các bài viết.");
            }

            await _tagRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<TagDto>> GetAllTagsAsync()
        {
            var tags = await _tagRepository.GetAllAsync();
            return tags.Select(t => new TagDto { TagId = t.TagId, TagName = t.TagName });
        }

        public async Task<TagDto> GetTagByIdAsync(int id)
        {
            var tag = await _tagRepository.GetByIdAsync(id);
            if (tag == null) return null;

            return new TagDto { TagId = tag.TagId, TagName = tag.TagName };
        }

        public async Task UpdateTagAsync(int id, CreateTagDto tagDto)
        {
            var tagToUpdate = await _tagRepository.GetByIdAsync(id);
            if (tagToUpdate == null)
            {
                throw new KeyNotFoundException("Không tìm thấy tag.");
            }

            var tagName = tagDto.TagName.Trim().ToLower();
            tagToUpdate.TagName = tagName;
            tagToUpdate.Note = tagDto.Note;
            var existingTag = await _tagRepository.GetByNameAsync(tagName);
            if (existingTag != null && existingTag.TagId != id)
            {
                throw new ArgumentException($"Tag với tên '{tagDto.TagName}' đã tồn tại.");
            }

            tagToUpdate.TagName = tagName;
            await _tagRepository.UpdateAsync(tagToUpdate);
        }

        public ICollection<TagDto> ToDtoList(ICollection<Tag> tags)
        {
            var tagDtos = new List<TagDto>();

            foreach (var tag in tags)
            {
                tagDtos.Add(new TagDto
                {
                    TagId = tag.TagId,
                    TagName = tag.TagName,
                    Note = tag.Note
                });
            }

            return tagDtos;
        }
    }
}
