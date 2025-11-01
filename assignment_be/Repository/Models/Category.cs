#nullable disable
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Repository.Models;

public partial class Category
{
    public int CategoryId { get; set; }

    public string CategoryName { get; set; }

    public string CategoryDescription { get; set; }

    public int? ParentCategoryId { get; set; }

    public bool IsActive { get; set; }

    [JsonIgnore]
    public virtual ICollection<Category> InverseParentCategory { get; set; } = new List<Category>();

    [JsonIgnore]
    public virtual ICollection<NewsArticle> NewsArticles { get; set; } = new List<NewsArticle>();

    [JsonIgnore]
    public virtual Category ParentCategory { get; set; }
}