using System;

namespace Verable.Client.Contracts
{
    public class ServiceDefinition
    {
        public string Name { get; set; }
        public string Version { get; set; }
        public Uri Endpoint { get; set; }
    }
}