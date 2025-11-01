#nullable disable
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Repository.Models;

public partial class SystemAccount
{
    [Key]
    public int AccountId { get; set; }

    public string AccountName { get; set; }

    public string AccountEmail { get; set; }

    public int AccountRole { get; set; }

    public bool IsActive { get; set; }

    [JsonIgnore]
    public string AccountPassword { get; set; }

    [JsonIgnore]
    public virtual ICollection<NewsArticle> NewsArticleCreatedBies { get; set; } = new List<NewsArticle>();

    [JsonIgnore]
    public virtual ICollection<NewsArticle> NewsArticleUpdatedBies { get; set; } = new List<NewsArticle>();
}