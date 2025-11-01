namespace WebAPI.CustomResponse
{
    public class ApiResponse<T>
    {
        public ResponseCode Code { get; set; }
        public string Status => Code == ResponseCode.Success ? "success" : "error";
        public string? Message { get; set; }
        public T? Data { get; set; }
        public object? Errors { get; set; }

        public static ApiResponse<T> Success(T data, ResponseMessage msg = ResponseMessage.RequestSuccessful)
        {
            return new ApiResponse<T>
            {
                Code = ResponseCode.Success,
                Message = msg.GetMessage(),
                Data = data
            };
        }

        public static ApiResponse<T> Fail(ResponseCode code, ResponseMessage msg, object? errors = null)
        {
            return new ApiResponse<T>
            {
                Code = code,
                Message = msg.GetMessage(),
                Errors = errors
            };
        }
    }
}
