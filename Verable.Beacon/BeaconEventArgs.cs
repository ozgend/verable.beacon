using System;
using System.Net.Sockets;

namespace Verable.Beacon
{
    public class BeaconEventArgs : EventArgs
    {
        public string Data { get; private set; }
        public string ClientIp { get; private set; }

        public BeaconEventArgs(string data)
        {
            Data = data;
        }

        public BeaconEventArgs(string data, string clientIp)
        {
            Data = data;
            ClientIp = clientIp;
        }



    }
}