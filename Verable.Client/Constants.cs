using System;
using System.Collections.Generic;
using System.Text;

namespace Verable.Client
{
    internal class Constants
    {
        public struct Config
        {
            public const string Verable = "Verable";
        }

        public struct Command
        {
            public const string Register = "REG";
            public const string Deregister = "DRG";
            public const string List = "LST";
            public const string Heartbeat = "HRB";
            public const string Seperator = "|";
        }
    }
}
