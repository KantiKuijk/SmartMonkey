type SMUserIDs = {
  ssid: string;
  userid: string;
  userlt: string;
  idString: string;
};

export async function getUserIDs() {
  return new Promise<SMUserIDs>((res, _rej) => {
    const localRead = localStorage.getItem("smartmonkey_uids");
    if (localRead) {
      res(JSON.parse(localRead));
    } else {
      const localStorageKeys = Object.keys(localStorage);
      const anyUIDkeyRegex = /^.*[\/_-]([0-9]{4}_[0-9]{4}_[0-9]{0,1})$/;
      const anyUIDkey = localStorageKeys.filter((k) =>
        anyUIDkeyRegex.test(k)
      )[0];
      function resWithIdString(idString: string) {
        const [ssid, userid, userlt] = idString.split("_") as [
          string,
          string,
          string
        ];
        const uids = { ssid, userid, userlt, idString };
        localStorage.setItem("smartmonkey_uids", JSON.stringify(uids));
        res(uids);
      }
      if (anyUIDkey) resWithIdString(anyUIDkey.replace(anyUIDkeyRegex, "$1"));
      else {
        const interval = setInterval(() => {
          const href = window.location.href;
          const fullRegex =
            /(https:\/\/[a-zA-Z]+\.smartschool\.be\/planner\/main\/user)\/([0-9_]+)\/([0-9]{4}-[0-9]{2}-[0-9]{2})\/?/;
          if (fullRegex.test(href)) {
            clearTimeout(interval);
            resWithIdString(href.replace(fullRegex, "$2"));
          }
        }, 33);
      }
    }
  });
}
