using DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.IService;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI.CustomResponse;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        [AllowAnonymous] 
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                var categories = await _categoryService.GetAllCategoriesAsync();

                return Ok(ApiResponse<IEnumerable<CategoryDto>>.Success(
                    categories,
                    ResponseMessage.RequestSuccessful
                ));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(
                    ResponseCode.InternalServerError,
                    ResponseMessage.UnexpectedError,
                    ex.Message
                ));
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            try
            {
                var category = await _categoryService.GetCategoryByIdAsync(id);

                return Ok(ApiResponse<CategoryDto>.Success(
                    category,
                    ResponseMessage.RequestSuccessful
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(
                    ResponseCode.NotFound,
                    ResponseMessage.ResourceNotFound,
                    ex.Message
                ));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(
                    ResponseCode.InternalServerError,
                    ResponseMessage.UnexpectedError,
                    ex.Message
                ));
            }
        }

        [HttpPost]
        //[Authorize(Roles = "1")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto categoryDto)
        {
            try
            {
                var newCategory = await _categoryService.CreateCategoryAsync(categoryDto);

                return Ok(ApiResponse<CategoryDto>.Success(
                    newCategory,
                    ResponseMessage.RequestSuccessful
                ));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<object>.Fail(
                    ResponseCode.BadRequest,
                    ResponseMessage.ValidationError,
                    ex.Message
                ));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(
                    ResponseCode.InternalServerError,
                    ResponseMessage.UnexpectedError,
                    ex.Message
                ));
            }
        }

        [HttpPut("{id}")]
        //[Authorize(Roles = "1")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CreateCategoryDto categoryDto)
        {
            try
            {
                await _categoryService.UpdateCategoryAsync(id, categoryDto);

                return Ok(ApiResponse<object>.Success(
                    null,
                    ResponseMessage.RequestSuccessful
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(
                    ResponseCode.NotFound,
                    ResponseMessage.ResourceNotFound,
                    ex.Message
                ));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<object>.Fail(
                    ResponseCode.BadRequest,
                    ResponseMessage.ValidationError,
                    ex.Message
                ));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(
                    ResponseCode.InternalServerError,
                    ResponseMessage.UnexpectedError,
                    ex.Message
                ));
            }
        }

        [HttpDelete("{id}")]
        //[Authorize(Roles = "1")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                await _categoryService.DeleteCategoryAsync(id);

                return Ok(ApiResponse<object>.Success(
                    null,
                    ResponseMessage.RequestSuccessful
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(
                    ResponseCode.NotFound,
                    ResponseMessage.ResourceNotFound,
                    ex.Message
                ));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.Fail(
                    ResponseCode.BadRequest,
                    ResponseMessage.BusinessError,
                    ex.Message
                ));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(
                    ResponseCode.InternalServerError,
                    ResponseMessage.UnexpectedError,
                    ex.Message
                ));
            }
        }
    }
}