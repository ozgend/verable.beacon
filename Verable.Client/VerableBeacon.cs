using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Verable.Client.Contracts;

namespace Verable.Client
{
    public class VerableBeacon
    {
        private Settings _config;
        private static VerableBeacon _instance;

        public static VerableBeacon Init(IConfiguration configuration)
        {
            if (_instance == null)
            {
                _instance = new VerableBeacon();
                _instance._config = new Settings();
                configuration.Bind("Verable", _instance._config);
            }

            return _instance;
        }


        public async Task Register(ServiceDefinition definition)
        {
            var request = Pack(Constants.Command.Register, definition, true);
            await Send(request);
        }

        public async Task Deregister(ServiceDefinition definition)
        {
            var request = Pack(Constants.Command.Deregister, definition, true);
            await Send(request);
        }

        public async Task<List<ServiceDefinition>> List(string name)
        {
            var request = Pack(Constants.Command.List, name);
            var response = await Send(request);
            var result = Unpack<List<ServiceDefinition>>(response, true);
            return result;
        }

        private async Task<string> Send(string data)
        {
            try
            {
                IPAddress ipAddress = null;
                var singleEndpoint = _instance._config.GetSingleBeaconEndpoint();
                var beaconEndpoint = new Uri(singleEndpoint);
                var ipAddressList = Dns.GetHostAddresses(beaconEndpoint.DnsSafeHost);

                for (var i = 0; i < ipAddressList.Length; ++i)
                {
                    if (ipAddressList[i].AddressFamily == AddressFamily.InterNetwork)
                    {
                        ipAddress = ipAddressList[i];
                        break;
                    }
                }

                if (ipAddress == null)
                {
                    throw new Exception($"No IPv4 address for server {singleEndpoint}");
                }

                var client = new TcpClient();
                await client.ConnectAsync(ipAddress, beaconEndpoint.Port);
                var networkStream = client.GetStream();
                var streamWriter = new StreamWriter(networkStream);
                var streamReader = new StreamReader(networkStream);

                streamWriter.AutoFlush = true;

                await streamWriter.WriteAsync(data);
                var response = await streamReader.ReadToEndAsync();

                client.Close();

                return response;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return string.Empty;
            }
        }

        private string Pack(string command, object data = null, bool requireSerialization = false)
        {
            var packet = new BeaconPacket
            {
                Command = command,
                Serialized = requireSerialization
            };

            if (data != null)
            {
                packet.Data = requireSerialization
                    ? JsonConvert.SerializeObject(data)
                    : (string)data;
            }

            var stringified = packet.ToString();
            var plainTextBytes = Encoding.UTF8.GetBytes(stringified);
            return Convert.ToBase64String(plainTextBytes);
        }

        private TResult Unpack<TResult>(string encoded, bool expectSerialized = false)
        {
            var bytes = Convert.FromBase64String(encoded);
            var stringified = Encoding.UTF8.GetString(bytes);
            TResult data;
            if (expectSerialized)
            {
                data = JsonConvert.DeserializeObject<TResult>(stringified);
            }
            else
            {
                data = (TResult)Convert.ChangeType(stringified, typeof(TResult));
            }
            return data;
        }
    }
}
