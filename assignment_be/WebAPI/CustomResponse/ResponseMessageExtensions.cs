namespace WebAPI.CustomResponse
{
    public static class ResponseMessageExtensions
    {
        public static string GetMessage(this ResponseMessage message)
        {
            return message switch
            {
                ResponseMessage.RequestSuccessful => "Yêu cầu được thực hiện thành công",
                ResponseMessage.InvalidRequest => "Dữ liệu yêu cầu không hợp lệ",
                ResponseMessage.UnauthorizedAccess => "Bạn không có quyền truy cập",
                ResponseMessage.ResourceNotFound => "Không tìm thấy tài nguyên",
                ResponseMessage.UnexpectedError => "Đã xảy ra lỗi không mong muốn",
                ResponseMessage.ValidationError => "Dữ liệu không hợp lệ",
                ResponseMessage.BusinessError => "Vi phạm quy tắc nghiệp vụ",
                _ => "Trạng thái không xác định"
            };
        }
    }
}
