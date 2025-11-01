#nullable disable
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Repository.Models;

public partial class Tag
{
    public int TagId { get; set; }

    public string TagName { get; set; }

    public string Note { get; set; }

    [JsonIgnore]
    public virtual ICollection<NewsArticle> NewsArticles { get; set; } = new List<NewsArticle>();
}