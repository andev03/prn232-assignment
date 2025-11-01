using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class NewsArticleDto
    {
        public int NewsArticleId { get; set; }
        public string Headline { get; set; }
        public string NewsTitle { get; set; }
        public string NewsContent { get; set; }
        public DateTime CreatedDate { get; set; }
        public int Views { get; set; }
        public bool NewsStatus { get; set; }
        public string CategoryName { get; set; }
        public string CreatedByName { get; set; }
        public string NewsSource { get; set; }

        public ICollection<TagDto> Tags { get; set; }
    }
}
