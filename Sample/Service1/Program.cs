using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Verable.Client;
using Verable.Client.Contracts;

namespace Service1
{
    class Program
    {
        private static IConfigurationRoot _configuration;
        private static VerableBeacon _verableBeacon;

        static async Task Main(string[] args)
        {
            var builder = new ConfigurationBuilder()
                           .SetBasePath(Directory.GetCurrentDirectory())
                           .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

            _configuration = builder.Build();
            
        
            _verableBeacon = VerableBeacon.Init(_configuration);
            
            Console.WriteLine("running");

            var serviceDefinition1 = new ServiceDefinition { Endpoint = new Uri("http://localhost:6601"), Name = "Service1", Version = "1.0" };
            var serviceDefinition2 = new ServiceDefinition { Endpoint = new Uri("http://localhost:6602"), Name = "Service2", Version = "1.0" };
            var serviceDefinition3 = new ServiceDefinition { Endpoint = new Uri("http://localhost:6603"), Name = "Service2", Version = "1.1" };

            await _verableBeacon.Register(serviceDefinition1);
            await _verableBeacon.Register(serviceDefinition2);
            await _verableBeacon.Register(serviceDefinition3);

            var definiton = await _verableBeacon.List("Service2");

            
            Console.ReadLine();
        }
    }
}
