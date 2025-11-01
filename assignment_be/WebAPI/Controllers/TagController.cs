using DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Services.IService;
using WebAPI.CustomResponse;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class TagController : ControllerBase
    {
        private readonly ITagService _tagService;

        public TagController(ITagService tagService)
        {
            _tagService = tagService;
        }

        [HttpGet]
        [AllowAnonymous] 
        public async Task<IActionResult> GetAllTags()
        {
            var tags = await _tagService.GetAllTagsAsync();
            return Ok(ApiResponse<IEnumerable<TagDto>>.Success(tags));
        }

        [HttpGet("{id}")]
        [AllowAnonymous] 
        public async Task<IActionResult> GetTagById(int id)
        {
            var tag = await _tagService.GetTagByIdAsync(id);
            if (tag == null)
            {
                return NotFound(ApiResponse<object>.Fail(ResponseCode.NotFound, ResponseMessage.ResourceNotFound)); 
            }
            return Ok(ApiResponse<TagDto>.Success(tag));
        }

        [HttpPost]
        //[Authorize(Roles = "1")] 
        public async Task<IActionResult> CreateTag([FromBody] CreateTagDto tagDto)
        {
            try
            {
                var newTag = await _tagService.CreateTagAsync(tagDto);
                return CreatedAtAction(nameof(GetTagById),
                    new { id = newTag.TagId },
                    ApiResponse<TagDto>.Success(newTag));
            }
            catch (ArgumentException ex) 
            {
                return BadRequest(ApiResponse<object>.Fail(ResponseCode.BadRequest, ResponseMessage.ValidationError, ex.Message));
            }
        }

        [HttpPut("{id}")]
        //[Authorize(Roles = "1")]
        public async Task<IActionResult> UpdateTag(int id, [FromBody] CreateTagDto tagDto)
        {
            try
            {
                await _tagService.UpdateTagAsync(id, tagDto);
                return Ok(ApiResponse<object>.Success(null, ResponseMessage.RequestSuccessful));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ResponseCode.NotFound, ResponseMessage.ResourceNotFound, ex.Message));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<object>.Fail(ResponseCode.BadRequest, ResponseMessage.ValidationError, ex.Message));
            }
        }

        [HttpDelete("{id}")]
        //[Authorize(Roles = "1")]
        public async Task<IActionResult> DeleteTag(int id)
        {
            try
            {
                await _tagService.DeleteTagAsync(id);
                return Ok(ApiResponse<object>.Success(null, ResponseMessage.RequestSuccessful));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ResponseCode.NotFound, ResponseMessage.ResourceNotFound, ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.Fail(ResponseCode.BadRequest, ResponseMessage.BusinessError, ex.Message));
            }
        }
    }
}
