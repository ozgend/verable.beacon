using System;
using System.IO;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Verable.Client;
using Verable.Client.Contracts;

namespace Service1
{
    class Program
    {
        private static IConfigurationRoot _configuration;
        private static VerableRegistry _registry;

        static async Task Main(string[] args)
        {
            var builder = new ConfigurationBuilder()
                           .SetBasePath(Directory.GetCurrentDirectory())
                           .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

            _configuration = builder.Build();
            _registry = VerableRegistry.Init(_configuration);

            Console.WriteLine("running");

            var serviceDefinition1 = new ServiceDefinition { Endpoint = new Uri("http://localhost:6601"), Name = "Service1", Version = "1" };
            var serviceDefinition2 = new ServiceDefinition { Endpoint = new Uri("http://localhost:6602"), Name = "Service2", Version = "1" };
            var serviceDefinition3 = new ServiceDefinition { Endpoint = new Uri("http://localhost:6603"), Name = "Service3", Version = "1" };


            await _registry.PublishAsync(serviceDefinition1);
            await _registry.PublishAsync(serviceDefinition2);
            await _registry.PublishAsync(serviceDefinition3);

        }
    }
}
