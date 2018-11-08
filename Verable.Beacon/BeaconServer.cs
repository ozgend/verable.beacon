using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Verable.Beacon
{
    public class BeaconServer : IDisposable
    {
        private readonly TcpListener _tcpListener;
        private CancellationTokenSource _tokenSource;
        private CancellationToken _token;
        public event EventHandler<BeaconEventArgs> BeaconEventReceived;
        public bool IsListening { get; private set; }

        public BeaconServer(IPAddress address, int port)
        {
            _tcpListener = new TcpListener(address, port);
        }

        public static BeaconServer Create(IPAddress address, int port)
        {
            return new BeaconServer(address, port);
        }

        public async Task RunAsync(CancellationToken? token = null)
        {
            _tokenSource = CancellationTokenSource.CreateLinkedTokenSource(token ?? new CancellationToken());
            _token = _tokenSource.Token;
            _tcpListener.Start();
            IsListening = true;

            try
            {
                while (!_token.IsCancellationRequested)
                {
                    await Task.Run(async () =>
                    {
                        var connectedClient = await _tcpListener.AcceptTcpClientAsync();
                        var clientIp = ((IPEndPoint)connectedClient.Client.RemoteEndPoint).Address.ToString();
                        var stream = connectedClient.GetStream();
                        var streamData = new byte[1024];
                        string rawData;

                        using (var memoryStream = new MemoryStream())
                        {
                            int bytesRead;
                            while ((bytesRead = stream.Read(streamData, 0, streamData.Length)) > 0)
                            {
                                memoryStream.Write(streamData, 0, bytesRead);
                            }
                            rawData = Encoding.ASCII.GetString(memoryStream.ToArray(), 0, (int)memoryStream.Length);
                        }

                        BeaconEventReceived?.Invoke(this, new BeaconEventArgs(rawData, clientIp));

                    }, _token);
                }
            }
            finally
            {
                _tcpListener.Stop();
                IsListening = false;
            }
        }

        public void Stop()
        {
            _tokenSource?.Cancel();
        }

        public void Dispose()
        {
            Stop();
        }

    }
}