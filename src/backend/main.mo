import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";



actor {
  type Article = {
    id : Nat;
    title : Text;
    content : Text;
    publishedDate : Text;
    author : Text;
    summary : Text;
    imageUrl : Text;
    category : Category;
    likes : Nat;
    views : Nat;
  };

  type Category = {
    #cricket;
    #influencers;
    #sports;
    #internationalNews;
    #nationalNews;
    #incidents;
  };

  module Article {
    public func compare(a1 : Article, a2 : Article) : Order.Order {
      Nat.compare(a2.id, a1.id);
    };
  };

  type Sponsor = {
    id : Nat;
    title : Text;
    imageUrl : Text;
    linkUrl : Text;
    position : Position;
    isActive : Bool;
    createdAt : Text;
  };

  type Position = {
    #top;
    #mid;
    #bottom;
  };

  module Sponsor {
    public func compare(s1 : Sponsor, s2 : Sponsor) : Order.Order {
      Nat.compare(s2.id, s1.id);
    };
  };

  type Comment = {
    id : Nat;
    articleId : Nat;
    author : Text;
    text : Text;
    createdAt : Text;
    isPinned : Bool;
  };

  module Comment {
    public func compareByCreatedAt(a : Comment, b : Comment) : Order.Order {
      Nat.compare(b.id, a.id);
    };
  };

  var nextArticleId = 1;
  let articles = Map.empty<Nat, Article>();

  var nextSponsorId = 1;
  let sponsors = Map.empty<Nat, Sponsor>();

  var nextCommentId = 1;
  let comments = Map.empty<Nat, Comment>();

  public shared ({ caller }) func seedSampleData() : async () {
    if (articles.size() > 0) { Runtime.trap("Already seeded") };

    func addSampleArticle(title : Text, content : Text, author : Text, publishedDate : Text, summary : Text, imageUrl : Text, category : Category) {
      let article : Article = {
        id = nextArticleId;
        title;
        content;
        author;
        publishedDate;
        summary;
        imageUrl;
        category;
        likes = 0;
        views = 0;
      };
      articles.add(nextArticleId, article);
      nextArticleId += 1;
    };

    addSampleArticle(
      "Influencer Marketing Trends 2024",
      "The influencer marketing industry continues to evolve with new platforms, content formats, and measurement tools...",
      "Jane Smith",
      "2024-06-01",
      "Discover the latest trends shaping influencer marketing in 2024.",
      "https://example.com/influencer-trends.jpg",
      #influencers,
    );

    addSampleArticle(
      "BCCI Announces 2024 Cricket Schedule",
      "The BCCI has unveiled the cricket calendar for 2024, featuring a packed schedule of international and domestic tournaments...",
      "Rahul Sharma",
      "2024-06-02",
      "The Board of Control for Cricket in India releases the much-anticipated 2024 schedule.",
      "https://example.com/cricket-schedule.jpg",
      #cricket,
    );

    addSampleArticle(
      "Top 10 Influencers to Watch in 2024",
      "From lifestyle and fashion to tech and gaming, these ten influencers are poised for major growth in 2024...",
      "Samantha Lee",
      "2024-06-03",
      "Meet the rising stars set to dominate the influencer space this year.",
      "https://example.com/top-influencers.jpg",
      #influencers,
    );

    addSampleArticle(
      "IPL 2024: Player Auction Results",
      "This year's IPL player auction witnessed intense bidding wars as teams vied for top international and homegrown talent...",
      "Anil Kumar",
      "2024-06-04",
      "The IPL 2024 player auction sees record-breaking bids and exciting team changes.",
      "https://example.com/ipl-auction.jpg",
      #cricket,
    );

    addSampleArticle(
      "Influencers Driving Social Cause Awareness",
      "Influencers are increasingly using their reach to raise awareness about social causes...",
      "Priya Patel",
      "2024-06-05",
      "How top creators are leveraging their platforms for positive change.",
      "https://example.com/social-impact.jpg",
      #influencers,
    );

    addSampleArticle(
      "India vs. Australia Test Series Preview",
      "The upcoming India-Australia Test series is generating massive excitement among cricket enthusiasts...",
      "Vikram Singh",
      "2024-06-06",
      "A deep dive into the highly anticipated Test series between cricket giants.",
      "https://example.com/test-series.jpg",
      #cricket,
    );

    addSampleArticle(
      "Sports Nutrition for Influencers",
      "Learn how top influencers maintain peak performance through proper sports nutrition...",
      "Maria Gomez",
      "2024-06-07",
      "Discover the dietary secrets of leading fitness influencers.",
      "https://example.com/nutrition.jpg",
      #sports,
    );

    addSampleArticle(
      "International Sports on the Rise",
      "Global interest in sports is surging, with new leagues and tournaments emerging worldwide...",
      "David Kim",
      "2024-06-08",
      "Exploring the international growth of sports viewership.",
      "https://example.com/global-sports.jpg",
      #internationalNews,
    );

    addSampleArticle(
      "National Policy Impact on Sports",
      "Government policies are playing a significant role in shaping the sports ecosystem...",
      "Rakesh Menon",
      "2024-06-09",
      "Analyzing the influence of national policies on sports development.",
      "https://example.com/policy-impact.jpg",
      #nationalNews,
    );

    addSampleArticle(
      "Incident Response in Influencer Marketing",
      "Proper crisis management is crucial for brands engaging with influencers...",
      "Jessica Brown",
      "2024-06-10",
      "Best practices for handling PR incidents in influencer marketing.",
      "https://example.com/pr-crisis.jpg",
      #incidents,
    );

    addSampleArticle(
      "Cricket Injuries and Recovery Timelines",
      "In-depth analysis of common cricket injuries and recovery strategies for athletes...",
      "Dr. Anjali Rao",
      "2024-06-11",
      "Medical insights into managing and preventing cricket-related injuries.",
      "https://example.com/injury-recovery.jpg",
      #incidents,
    );
  };

  public shared ({ caller }) func createArticle(title : Text, content : Text, publishedDate : Text, author : Text, summary : Text, imageUrl : Text, category : Category) : async Nat {
    let article : Article = {
      id = nextArticleId;
      title;
      content;
      publishedDate;
      author;
      summary;
      imageUrl;
      category;
      likes = 0;
      views = 0;
    };
    articles.add(nextArticleId, article);
    nextArticleId += 1;
    article.id;
  };

  public query ({ caller }) func getAllArticles() : async [Article] {
    articles.values().toArray().sort();
  };

  public query ({ caller }) func getArticlesByCategory(category : Category) : async [Article] {
    articles.values().toArray().filter(
      func(article) { article.category == category }
    ).sort();
  };

  public query ({ caller }) func getArticleById(id : Nat) : async Article {
    switch (articles.get(id)) {
      case (null) { Runtime.trap("Article not found") };
      case (?article) { article };
    };
  };

  public shared ({ caller }) func updateArticle(id : Nat, title : Text, content : Text, publishedDate : Text, author : Text, summary : Text, imageUrl : Text, category : Category) : async () {
    switch (articles.get(id)) {
      case (null) { Runtime.trap("Article not found") };
      case (?oldArticle) {
        let updatedArticle : Article = {
          oldArticle with
          id;
          title;
          content;
          publishedDate;
          author;
          summary;
          imageUrl;
          category;
        };
        articles.add(id, updatedArticle);
      };
    };
  };

  public shared ({ caller }) func deleteArticle(id : Nat) : async () {
    switch (articles.get(id)) {
      case (null) { Runtime.trap("Article not found") };
      case (?_) {
        articles.remove(id);
      };
    };
  };

  public shared ({ caller }) func likeArticle(id : Nat) : async () {
    switch (articles.get(id)) {
      case (null) { Runtime.trap("Article not found") };
      case (?oldArticle) {
        let updatedArticle : Article = {
          oldArticle with
          likes = oldArticle.likes + 1;
        };
        articles.add(id, updatedArticle);
      };
    };
  };

  public shared ({ caller }) func recordView(id : Nat) : async () {
    switch (articles.get(id)) {
      case (null) { Runtime.trap("Article not found") };
      case (?oldArticle) {
        let updatedArticle : Article = {
          oldArticle with
          views = oldArticle.views + 1;
        };
        articles.add(id, updatedArticle);
      };
    };
  };

  // SPONSORS

  public shared ({ caller }) func createSponsor(title : Text, imageUrl : Text, linkUrl : Text, position : Position, createdAt : Text) : async Nat {
    let sponsor : Sponsor = {
      id = nextSponsorId;
      title;
      imageUrl;
      linkUrl;
      position;
      isActive = true;
      createdAt;
    };
    sponsors.add(nextSponsorId, sponsor);
    nextSponsorId += 1;
    sponsor.id;
  };

  public query ({ caller }) func getAllSponsors() : async [Sponsor] {
    sponsors.values().toArray().sort();
  };

  public query ({ caller }) func getActiveSponsorsByPosition(position : Position) : async [Sponsor] {
    sponsors.values().toArray().filter(
      func(sponsor) { sponsor.position == position and sponsor.isActive }
    ).sort();
  };

  public query ({ caller }) func getSponsorById(id : Nat) : async Sponsor {
    switch (sponsors.get(id)) {
      case (null) { Runtime.trap("Sponsor not found") };
      case (?sponsor) { sponsor };
    };
  };

  public shared ({ caller }) func updateSponsor(id : Nat, title : Text, imageUrl : Text, linkUrl : Text, position : Position) : async () {
    switch (sponsors.get(id)) {
      case (null) { Runtime.trap("Sponsor not found") };
      case (?sponsor) {
        let updatedSponsor : Sponsor = {
          sponsor with
          id;
          title;
          imageUrl;
          linkUrl;
          position;
        };
        sponsors.add(id, updatedSponsor);
      };
    };
  };

  public shared ({ caller }) func deleteSponsor(id : Nat) : async () {
    switch (sponsors.get(id)) {
      case (null) { Runtime.trap("Sponsor not found") };
      case (?_) {
        sponsors.remove(id);
      };
    };
  };

  public shared ({ caller }) func toggleSponsorActive(id : Nat) : async () {
    switch (sponsors.get(id)) {
      case (null) { Runtime.trap("Sponsor not found") };
      case (?sponsor) {
        let updatedSponsor : Sponsor = {
          sponsor with isActive = not sponsor.isActive;
        };
        sponsors.add(id, updatedSponsor);
      };
    };
  };

  // COMMENTS

  public shared ({ caller }) func createComment(articleId : Nat, author : Text, text : Text, createdAt : Text) : async Nat {
    switch (articles.get(articleId)) {
      case (null) { Runtime.trap("Article not found") };
      case (?_) {
        let comment : Comment = {
          id = nextCommentId;
          articleId;
          author;
          text;
          createdAt;
          isPinned = false;
        };
        comments.add(nextCommentId, comment);
        nextCommentId += 1;
        comment.id;
      };
    };
  };

  public query ({ caller }) func getCommentsByArticle(articleId : Nat) : async [Comment] {
    let allComments = comments.values().toArray();
    let filtered = allComments.filter(
      func(comment) { comment.articleId == articleId }
    );
    let pinned = filtered.filter(func(comment) { comment.isPinned });
    let unpinned = filtered.filter(func(comment) { not comment.isPinned });
    let sortedUnpinned = unpinned.sort(Comment.compareByCreatedAt);

    pinned.concat(sortedUnpinned);
  };

  public query ({ caller }) func getAllComments() : async [Comment] {
    comments.values().toArray().sort(Comment.compareByCreatedAt);
  };

  public shared ({ caller }) func deleteComment(id : Nat) : async () {
    switch (comments.get(id)) {
      case (null) { Runtime.trap("Comment not found") };
      case (?_) {
        comments.remove(id);
      };
    };
  };

  public shared ({ caller }) func togglePinComment(id : Nat) : async () {
    switch (comments.get(id)) {
      case (null) { Runtime.trap("Comment not found") };
      case (?comment) {
        let updatedComment : Comment = {
          comment with isPinned = not comment.isPinned;
        };
        comments.add(id, updatedComment);
      };
    };
  };
};
