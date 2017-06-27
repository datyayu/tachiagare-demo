# Tachiagare!

This is what happens when I'm free and home-alone on a weekend.



# About the songs format

The lyrics use a custom json format.

Basically, every json should have the following attributes:

- **"title"** -> Song title,
- **"group"** -> Name of the group.
- **"groupId"** -> Id of the group (because I'm too lazy to write a proper backend).
- **"lyrics"** -> The lyrics of the song (see lyrics format)
- **"audioFile"** -> An url to the audio file.

Optionally, can also contain this fields:

- **"color"** -> (Optional) Custom color for the song title.
- **"embedded"** -> (Optional) Code to embed into the "live" section, like an iframe or such. Just make sure it's using https or it won't work.


## Lyrics format

The lyrics field in each song consists of a series of arrays with each word and it's timing, with some addional metadata. Each item has up to four components:

```json
[< WORD >, < START-TIME >, < IS-CALL >, < CALL-COLOR >]
```
```json
  ...
  [ "hello", 193, true, "#3cc" ],
  ...
```

However, the `<IS-CALL>` and `<CALL-COLOR>` components are intended for calls only and will be ignored if they aren't specified. Each item can contain only the `< WORD >` and `<START-TIME>` and still we be parsed as a part of the song.

```json
  ["hello", 193]
```

Additionally, an empty array will be taken as the end of a line and can be used to break lines and to separate verses.

```json
  []
```

Finally, whitespace is preserved, so you can use it as much as you want to improve the visuals of the lyrics.

```json
  ["                                     Fu", 45.2, true],
```
