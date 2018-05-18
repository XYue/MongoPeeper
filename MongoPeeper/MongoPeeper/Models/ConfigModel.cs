using Enterprise.MongoRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MongoPeeper.Models
{
    public class ConfigModel : MongoEntity
    {
        public string Name { get; set; }
        public string IP { get; set; }
        public string Port { get; set; }
        public string Database { get; set; }
        public string Table { get; set; }
        public DateTime CreateTime { get; set; }
    }
}