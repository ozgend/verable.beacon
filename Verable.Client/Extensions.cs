using System;
using Verable.Client.Contracts;

namespace Verable.Client
{
    internal static class Extensions
    {
        private static Random _random = new Random();

        public static string GetSingleBeaconEndpoint(this Config config)
        {
            return config.BeaconEndpoint?.Length == 1
                ? config.BeaconEndpoint[0]
                : config.BeaconEndpoint[_random.Next(config.BeaconEndpoint.Length)];

        }
    }
}