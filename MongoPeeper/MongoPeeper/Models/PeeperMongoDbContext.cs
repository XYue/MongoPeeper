using Enterprise.MongoRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MongoPeeper.Models {
    public class PeeperMongoDbContext : MongoDbContext {
        public PeeperMongoDbContext() : base("MongoConnection") {
        }


    }
}