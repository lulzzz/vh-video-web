using System;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using VideoWeb.Common.Models;
using VideoWeb.Services.Video;

namespace VideoWeb.Common.Caching
{
    public class DistributedConferenceCache : IConferenceCache
    {
        private readonly IDistributedCache _distributedCache;

        private static JsonSerializerSettings SerializerSettings => new JsonSerializerSettings
        {
            TypeNameHandling = TypeNameHandling.Objects, Formatting = Formatting.None
        };

        public DistributedConferenceCache(IDistributedCache distributedCache)
        {
            _distributedCache = distributedCache;
        }

        public Task AddConferenceToCache(ConferenceDetailsResponse conferenceResponse)
        {
            var conference = ConferenceCacheMapper.MapConferenceToCacheModel(conferenceResponse);
            var serialisedConference = JsonConvert.SerializeObject(conference, SerializerSettings);

            var data = Encoding.UTF8.GetBytes(serialisedConference);

            return _distributedCache.SetAsync(conference.Id.ToString(), data,
                new DistributedCacheEntryOptions
                {
                    SlidingExpiration = TimeSpan.FromHours(4)
                });

        }

        public Conference GetConference(Guid id)
        {
            try
            {
                var data = _distributedCache.Get(id.ToString());
                var conferenceSerialised = Encoding.UTF8.GetString(data);
                var conference = JsonConvert.DeserializeObject<Conference>(conferenceSerialised, SerializerSettings);
                return conference;
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}