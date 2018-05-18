using System.Collections.Generic;
using System.Threading.Tasks;
using Enterprise.Infrastructure.Ioc;
using Enterprise.Infrastructure.Utilities;
using MongoPeeper.Models;

namespace MongoPeeper.Services
{
    public interface IPeeperService : IInjector
    {

        Task<object> GetList(string ip, string port, string database, string table, DatagridParams param);
        //Task<NewsModel> Get(User ui, string id);

        Task<object> GetConfigList(DatagridParams model);
        Task<ConfigModel> GetConfig(string id);
        Task<object> UpdateConfig(ConfigModel model);
        Task<bool> DeleteConfig(string id);
    }
}
