using System.ComponentModel.DataAnnotations;

namespace WebAPI
{
    public class AccountDto
    {
        public int AccountId { get; set; }

        [Required]
        [StringLength(100)]
        public string AccountName { get; set; }

        [Required]
        [EmailAddress]
        public string AccountEmail { get; set; }

        [Required]
        public int AccountRole { get; set; }

        public bool IsActive { get; set; } = true;

        [StringLength(100, MinimumLength = 6)]
        public string? AccountPassword { get; set; }
    }
}
