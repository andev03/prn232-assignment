namespace WebAPI.CustomResponse
{
    public enum ResponseCode
    {
        Success = 200,
        BadRequest = 400,
        Unauthorized = 401,
        NotFound = 404,
        InternalServerError = 500,

        ValidationFailed = 1001,
        BusinessRuleViolation = 1002
    }
}
