using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DTOs
{
    public class CreateNewsArticleDto
    {
        [Required]
        [StringLength(200)]
        public string NewsTitle { get; set; }

        public string? Headline { get; set; }

        [Required]
        public string NewsContent { get; set; }

        public string? NewsSource { get; set; }

        [Required]
        public int CategoryId { get; set; }

        public bool NewsStatus { get; set; } = true;

        public List<CreateTagDto>? Tags { get; set; } = new();
    }
}
