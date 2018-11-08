using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Verable.Client.Contracts;

namespace Verable.Client
{
    public class VerableRegistry
    {
        private static VerableRegistry _registry;

        private Config _config = new Config();

        public static VerableRegistry Init(IConfiguration configuration)
        {
            if (_registry == null)
            {
                _registry = new VerableRegistry(configuration);
            }
            return _registry;
        }

        private VerableRegistry(IConfiguration configuration)
        {
            configuration.Bind("Verable", _config);
            configuration.GetSection("Verable").Bind(_config);
        }

        public async Task PublishAsync(ServiceDefinition definition)
        {
            var serialized = JsonConvert.SerializeObject(definition);

            var singleEndpoint = _config.GetSingleBeaconEndpoint();


            var beaconEndpointUri = new Uri(singleEndpoint);

            await Task.Run(() =>
            {
                using (var beaconClient = new TcpClient())
                {
                    beaconClient.Connect(beaconEndpointUri.Host, beaconEndpointUri.Port);

                    using (var stream = beaconClient.GetStream())
                    {
                        var payload = Encoding.ASCII.GetBytes(serialized);
                        stream.Write(payload, 0, payload.Length);
                    }
                }
            });
        }

        public async Task<IEnumerable<ServiceDefinition>> DefineAsync(string serviceName)
        {
            return new List<ServiceDefinition>();
        }
    }

}
