using Microsoft.AspNetCore.Mvc;
using Repository.Models;
using Services.IService;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI;
using WebAPI.CustomResponse;

[ApiController]
[Route("api/[controller]")]
public class SystemAccountsController : ControllerBase
{
    private readonly ISystemAccountService _systemAccountService;

    public SystemAccountsController(ISystemAccountService systemAccountService)
    {
        _systemAccountService = systemAccountService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var accounts = await _systemAccountService.GetAllSystemAccountsAsync();
            return Ok(ApiResponse<IEnumerable<AccountDto>>.Success(
                accounts,
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

    [HttpPost]
    public async Task<IActionResult> Create(AccountDto accountDto)
    {
        try
        {
            var newAccount = await _systemAccountService.CreateAccountAsync(accountDto);

            return Ok(ApiResponse<AccountDto>.Success(
                newAccount,
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
    public async Task<IActionResult> Update(int id, [FromBody] AccountDto account)
    {
        try
        {
            var updated = await _systemAccountService.UpdateAccountAsync(id, account);

            return Ok(ApiResponse<object>.Success(
                updated,
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
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _systemAccountService.DeleteAccountAsync(id);

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