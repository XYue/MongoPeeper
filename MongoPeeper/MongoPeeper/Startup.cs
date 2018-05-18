using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(MongoPeeper.Startup))]
namespace MongoPeeper
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
