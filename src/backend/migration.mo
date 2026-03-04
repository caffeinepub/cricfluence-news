import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type Article = {
    id : Nat;
    title : Text;
    content : Text;
    publishedDate : Text;
    author : Text;
    summary : Text;
    imageUrl : Text;
    category : {
      #cricket;
      #influencers;
      #sports;
      #internationalNews;
      #nationalNews;
      #incidents;
    };
    likes : Nat;
    views : Nat;
  };

  type Sponsor = {
    id : Nat;
    title : Text;
    imageUrl : Text;
    linkUrl : Text;
    position : {
      #top;
      #mid;
      #bottom;
    };
    isActive : Bool;
    createdAt : Text;
  };

  type Comment = {
    id : Nat;
    articleId : Nat;
    author : Text;
    text : Text;
    createdAt : Text;
    isPinned : Bool;
  };

  type OldActor = {
    var nextArticleId : Nat;
    articles : Map.Map<Nat, Article>;
    var nextSponsorId : Nat;
    sponsors : Map.Map<Nat, Sponsor>;
  };

  type NewActor = {
    var nextArticleId : Nat;
    articles : Map.Map<Nat, Article>;
    var nextSponsorId : Nat;
    sponsors : Map.Map<Nat, Sponsor>;
    var nextCommentId : Nat;
    comments : Map.Map<Nat, Comment>;
  };

  public func run(old : OldActor) : NewActor {
    {
      var nextArticleId = old.nextArticleId;
      articles = old.articles;
      var nextSponsorId = old.nextSponsorId;
      sponsors = old.sponsors;
      var nextCommentId = 1;
      comments = Map.empty<Nat, Comment>();
    };
  };
};
