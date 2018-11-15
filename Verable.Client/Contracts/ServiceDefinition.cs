using System;
using Newtonsoft.Json;

namespace Verable.Client.Contracts
{
    public class ServiceDefinition
    {
        public string Uid { get; set; }
        public string Name { get; set; }
        public string Version { get; set; }
        public Uri Endpoint { get; set; }
    }
}