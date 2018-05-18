using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Script.Serialization;
using Enterprise.Infrastructure.Utilities;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using MongoPeeper.Models;
using Newtonsoft.Json;
using JsonConvert = Newtonsoft.Json.JsonConvert;
using System.Linq;
using System.Linq.Dynamic;

namespace MongoPeeper.Services
{
    public class PeeperService : IPeeperService
    {
        //private readonly UowNMAGtzy _gtzy_db;
        //private readonly UowNMAxCloud _db;
        ////private static readonly string HostUrl = ConfigUtils.GetAppSettingValue("http://172.22.24.7:10089/xCloudNews",
        ////    "NewsService");
        //private static readonly string HostUrl = ConfigUtils.GetAppSettingValue("http://cloud.nlis.local/xCloudNews",
        //    "xCloudNewsHost");

        private readonly UowMongo _db;

        public PeeperService()
        {
            _db = new UowMongo();
        }

        public void Dispose()
        {
        }

        public async Task<object> GetList(string ip, string port, string database, string table, DatagridParams param)
        {
            var list = new List<PeeperModel>();            
            var total = 0;

            try
            {
                var client = new MongoClient("mongodb://" + ip + ":" + port);
                var db = client.GetDatabase(database);
                var collection = db.GetCollection<BsonDocument>(table);

                total = await collection.AsQueryable().CountAsync();

                var pageIndex = param.Page >= 1 ? param.Page : 1;
                pageIndex -= 1;
                var pageRows = param.Rows > 0 ? param.Rows : 1;

                var query = await collection.Find(Builders<BsonDocument>.Filter.Exists("_id"))
                    .Sort(Builders<BsonDocument>.Sort.Descending("_id"))
                    .Skip(pageIndex * pageRows).Limit(pageRows).ToListAsync();


                //var query = collection.AsQueryable();
                //query = query.Skip( pageIndex * pageRows ).Take(pageRows);

                foreach (var c in query)
                {
                    list.Add(new PeeperModel()
                    {
                        Content = c.ToString()
                    });
                }
            }
            catch (Exception e)
            {
                System.Diagnostics.Trace.WriteLine(e);
                list.Clear();
            }

            return new { rows = list, total = total };
        }

        public async Task<object> GetConfigList(DatagridParams model) {
            var queries = (from p in _db.Table<ConfigModel>()
                           orderby p.CreateTime descending
                           select p).AsQueryable();
            if (!string.IsNullOrEmpty(model.FindText)) {
                queries = queries.Where(p => p.Name.Contains(model.FindText) || p.IP.Contains(model.FindText) || p.Database.Contains(model.FindText) || p.Table.Contains(model.FindText));
            }
            if (!string.IsNullOrEmpty(model.Sort) && !string.IsNullOrEmpty(model.Order)) {
                queries = queries.OrderBy(model.SortOrder);
            }

            var rows = queries.Skip((model.Page - 1) * model.Rows).Take(model.Rows).ToList()
                .Select(p => p).ToList();
            return new {
                total = queries.Count(),
                rows = rows
            };
        }

        public async Task<ConfigModel> GetConfig(string id) {
            return await _db.GetByIdAsync<ConfigModel>(id) ?? new ConfigModel();
        }
        public async Task<object> UpdateConfig(ConfigModel model) {
            if (string.IsNullOrWhiteSpace(model.Name)) return false;

            var entity = await _db.GetByIdAsync<ConfigModel>(model.MongoId);
            if (entity == null)
            {
                entity = new ConfigModel();
                entity.Name = model.Name;
                entity.IP = model.IP;
                entity.Port = model.Port;
                entity.Database = model.Database;
                entity.Table = model.Table;
                entity.CreateTime = DateTime.Now;
                return new { result = !string.IsNullOrWhiteSpace(await _db.InsertAsync(entity)), id = entity.MongoId};
            }
            else
            {
                entity.Name = model.Name;
                entity.IP = model.IP;
                entity.Port = model.Port;
                entity.Database = model.Database;
                entity.Table = model.Table;
                entity.CreateTime = DateTime.Now;
                return new { result = await _db.UpdateAsync(entity), id = entity.MongoId};
            }
        }
        public async Task<bool> DeleteConfig(string id) {
            return await _db.DeleteAsync<ConfigModel>(id);
        }
    }
}
