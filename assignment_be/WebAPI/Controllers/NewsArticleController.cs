using DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Repository.Models;
using Services.IService;
using Services.ServiceImplement;
using System; 
using System.Collections.Generic;
using System.Threading.Tasks; 
using WebAPI.CustomResponse;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NewsArticleController : ControllerBase
    {
        private readonly INewsArticleService _articleService;

        public NewsArticleController(INewsArticleService articleService)
        {
            _articleService = articleService;
        }

        [HttpGet]
        [AllowAnonymous] 
        public async Task<IActionResult> GetArticles()
        {
            try
            {
                var articles = await _articleService.GetAllAsync();
                return Ok(ApiResponse<IEnumerable<NewsArticleDto>>.Success(
                    articles,
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
        public async Task<IActionResult> GetArticle(int id)
        {
            try
            {
                var article = await _articleService.GetByIdAsync(id);

                if (article == null)
                {
                    return NotFound(ApiResponse<object>.Fail(
                        ResponseCode.NotFound,
                        ResponseMessage.ResourceNotFound
                    ));
                }

                return Ok(ApiResponse<NewsArticleDto>.Success(
                    article,
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
        public async Task<IActionResult> CreateArticle([FromBody] CreateNewsArticleDto articleDto)
        {
            try
            {
                var createdArticle = await _articleService.CreateAsync(articleDto);

                return Ok(ApiResponse<NewsArticleDto>.Success(
                    createdArticle,
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
        public async Task<IActionResult> UpdateArticle(int id, [FromBody] CreateNewsArticleDto articleDto)
        {
            try
            {
                await _articleService.UpdateAsync(id, articleDto);

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
        public async Task<IActionResult> DeleteArticle(int id)
        {
            try
            {
                await _articleService.DeleteAsync(id);
                
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

        [HttpGet("Account")]
        //[Authorize(Roles = "1")]
        public async Task<IActionResult> GetArticlesByAccountId()
        {
            var articles = await _articleService.GetArticlesByAccountIdAsync();

            return Ok(ApiResponse<IEnumerable<NewsArticleDto>>.Success(articles, ResponseMessage.RequestSuccessful));
        }
    }
}