import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";

actor {
  type Article = {
    id : Nat;
    title : Text;
    category : Text;
    summary : Text;
    content : Text;
    author : Text;
    publishedDate : Text;
    imageUrl : Text;
  };

  module Article {
    public func compare(a1 : Article, a2 : Article) : Order.Order {
      Nat.compare(a2.id, a1.id);
    };
  };

  var nextId = 1;
  let articles = Map.empty<Nat, Article>();

  public shared ({ caller }) func seedSampleData() : async () {
    if (articles.size() > 0) { Runtime.trap("Already seeded") };

    func addSampleArticle(title : Text, category : Text, summary : Text, content : Text, author : Text, publishedDate : Text, imageUrl : Text) {
      let article : Article = {
        id = nextId;
        title;
        category;
        summary;
        content;
        author;
        publishedDate;
        imageUrl;
      };
      articles.add(nextId, article);
      nextId += 1;
    };

    addSampleArticle(
      "Influencer Marketing Trends 2024",
      "Influencers",
      "Discover the latest trends shaping influencer marketing in 2024.",
      "The influencer marketing industry continues to evolve with new platforms, content formats, and measurement tools. Brands are increasingly focused on authentic partnerships, nano-influencers, and ROI-driven campaigns. Short-form video content remains king, particularly on TikTok and Instagram Reels. Expect to see more brands leveraging AI for influencer discovery and campaign optimization.",
      "Jane Smith",
      "2024-06-01",
      "https://example.com/influencer-trends.jpg",
    );

    addSampleArticle(
      "BCCI Announces 2024 Cricket Schedule",
      "Cricket",
      "The Board of Control for Cricket in India releases the much-anticipated 2024 schedule.",
      "The BCCI has unveiled the cricket calendar for 2024, featuring a packed schedule of international and domestic tournaments. Highlights include the India-Australia Test series, IPL 2024 season, and the return of the Champions Trophy. Fans can look forward to thrilling matches and star performances throughout the year.",
      "Rahul Sharma",
      "2024-06-02",
      "https://example.com/cricket-schedule.jpg",
    );

    addSampleArticle(
      "Top 10 Influencers to Watch in 2024",
      "Influencers",
      "Meet the rising stars set to dominate the influencer space this year.",
      "From lifestyle and fashion to tech and gaming, these ten influencers are poised for major growth in 2024. Expect innovative content, brand collaborations, and growing audiences across platforms like YouTube, TikTok, and Instagram. Keep an eye on these trendsetters as they shape digital culture.",
      "Samantha Lee",
      "2024-06-03",
      "https://example.com/top-influencers.jpg",
    );

    addSampleArticle(
      "IPL 2024: Player Auction Results",
      "Cricket",
      "The IPL 2024 player auction sees record-breaking bids and exciting team changes.",
      "This year's IPL player auction witnessed intense bidding wars as teams vied for top international and homegrown talent. Standout buys include Virat Kohli, Rashid Khan, and emerging superstar Shubman Gill. The 2024 season promises fierce competition and high entertainment value for cricket fans worldwide.",
      "Anil Kumar",
      "2024-06-04",
      "https://example.com/ipl-auction.jpg",
    );

    addSampleArticle(
      "Influencers Driving Social Cause Awareness",
      "Influencers",
      "How top creators are leveraging their platforms for positive change.",
      "Influencers are increasingly using their reach to raise awareness about social causes, from environmental sustainability to mental health advocacy. Brands are partnering with socially conscious creators to support campaigns that go beyond product promotion. This trend highlights the power of digital influence for driving real-world impact.",
      "Priya Patel",
      "2024-06-05",
      "https://example.com/social-impact.jpg",
    );

    addSampleArticle(
      "India vs. Australia Test Series Preview",
      "Cricket",
      "A deep dive into the highly anticipated Test series between cricket giants.",
      "The upcoming India-Australia Test series is generating massive excitement among cricket enthusiasts. Both teams boast world-class talent, strategic depth, and a fierce competitive spirit. Experts predict closely contested matches, standout performances from star players, and record-breaking viewership numbers worldwide.",
      "Vikram Singh",
      "2024-06-06",
      "https://example.com/test-series.jpg",
    );
  };

  public shared ({ caller }) func createArticle(title : Text, category : Text, summary : Text, content : Text, author : Text, publishedDate : Text, imageUrl : Text) : async Nat {
    let article : Article = {
      id = nextId;
      title;
      category;
      summary;
      content;
      author;
      publishedDate;
      imageUrl;
    };
    articles.add(nextId, article);
    nextId += 1;
    article.id;
  };

  public query ({ caller }) func getAllArticles() : async [Article] {
    articles.values().toArray().sort();
  };

  public query ({ caller }) func getArticlesByCategory(category : Text) : async [Article] {
    articles.values().toArray().sort().filter(
      func(article) { article.category == category }
    );
  };

  public query ({ caller }) func getArticleById(id : Nat) : async Article {
    switch (articles.get(id)) {
      case (null) { Runtime.trap("Article not found") };
      case (?article) { article };
    };
  };

  public shared ({ caller }) func updateArticle(id : Nat, title : Text, category : Text, summary : Text, content : Text, author : Text, publishedDate : Text, imageUrl : Text) : async () {
    switch (articles.get(id)) {
      case (null) { Runtime.trap("Article not found") };
      case (?_) {
        let updatedArticle : Article = {
          id;
          title;
          category;
          summary;
          content;
          author;
          publishedDate;
          imageUrl;
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
};
