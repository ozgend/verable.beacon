using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Verable.Beacon;

namespace Verable.Beacon
{
    class Program
    {
        private static IConfigurationRoot _configuration;

        static async Task Main(string[] args)
        {
            var builder = new ConfigurationBuilder()
               .SetBasePath(Directory.GetCurrentDirectory())
               .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

            _configuration = builder.Build();

            // var hostEntry = Dns.GetHostEntry("127.0.0.1");
            // IPAddress host = hostEntry.AddressList[0];

            IPAddress host = IPAddress.Any;
            int port = 7001;

            Console.WriteLine($"verable.beacon is running on {host}:{port}");

            var beaconServer = BeaconServer.Create(host, port);

            beaconServer.BeaconEventReceived += async (sender, beaconEvent) =>
            {
                // parse data events

                // beaconEvent.Data

                Console.WriteLine($"[{beaconEvent.ClientIp}] -- {beaconEvent.Data}");
            };

            await beaconServer.RunAsync();
        }
    }
}
