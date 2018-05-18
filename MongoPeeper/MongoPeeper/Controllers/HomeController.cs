using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using MongoPeeper.Models;
using MongoPeeper.Services;
using Enterprise.Infrastructure.Utilities;

namespace MongoPeeper.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public async Task<ActionResult> GetList(string ip, string port, string database, string table, DatagridParams param)
        {
            object page = null;
            using (var service = new PeeperService())
            {
                page = await service.GetList(ip, port, database, table, param);
            }
            return Json(page);
        }

        public async Task<ActionResult> GetConfigList(DatagridParams data)
        {
            object ret;
            using (var service = new PeeperService())
            {
                ret = await service.GetConfigList(data);
            }
            return Json(ret);
        }

        public async Task<ActionResult> GetConfig(string id)
        {
            object ret;
            using (var service = new PeeperService())
            {
                ret = await service.GetConfig(id);
            }
            return Json(ret);
        }

        public async Task<ActionResult> EditConfig(string id)
        {
            object ret;
            using (var service = new PeeperService())
            {
                ret = await service.GetConfig(id);
            }
            return Json(ret);
        }

        public async Task<ActionResult> UpdateConfig(ConfigModel model)
        {
            object ret;
            using (var service = new PeeperService())
            {
                ret = await service.UpdateConfig(model);
            }
            return Json(ret);
        }

        public async Task<ActionResult> DeleteConfig(string id)
        {
            object ret;
            using (var service = new PeeperService())
            {
                ret = await service.DeleteConfig(id);
            }
            return Json(ret);
        }

        public async Task<ActionResult> Peeper(ConfigModel model)
        {
            return View(model);
        }
    }
}