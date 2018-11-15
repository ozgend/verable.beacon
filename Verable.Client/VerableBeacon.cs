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
        private Settings _settings = new Settings();
        private static VerableBeacon _instance;
        public string RegistrationId;

        public static VerableBeacon Init(IConfiguration configuration)
        {
            if (_instance == null)
            {
                _instance = new VerableBeacon(configuration);
            }

            return _instance;
        }

        public VerableBeacon(IConfiguration configuration)
        {
            configuration.Bind("Verable", _settings);
        }

        public async Task<string> Register(ServiceDefinition definition, bool force = false)
        {
            if (!string.IsNullOrEmpty(RegistrationId))
            {
                Console.WriteLine($"Already registered with id: {RegistrationId}");

                if (!force)
                {
                    return RegistrationId;
                }

                await Deregister(RegistrationId);
            }
            var request = Pack(Constants.Command.Register, definition, true);
            var response = await Send(request);
            RegistrationId = Unpack<string>(response);
            return RegistrationId;
        }

        public async Task Deregister(string registrationId = null)
        {
            var request = Pack(Constants.Command.Deregister, registrationId ?? RegistrationId);
            await Send(request);
            RegistrationId = null;
        }

        public async Task<List<ServiceDefinition>> DiscoverOne(string name)
        {
            var request = Pack(Constants.Command.DiscoverOne, name);
            var response = await Send(request);
            var result = Unpack<List<ServiceDefinition>>(response, true);
            return result;
        }

        public async Task<Dictionary<string, List<ServiceDefinition>>> DiscoverAll()
        {
            var request = Pack(Constants.Command.DiscoverAll);
            var response = await Send(request);
            var result = Unpack<Dictionary<string, List<ServiceDefinition>>>(response, true);
            return result;
        }

        private async Task<string> Send(string data)
        {
            try
            {
                IPAddress ipAddress = null;
                var singleEndpoint = _instance._settings.GetSingleBeaconEndpoint();
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
