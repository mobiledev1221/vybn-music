1.2.0
 - integrated Triton Digital Ads
 - updated some message texts
 - updated style of Tier buttons
 - updated Cancel button behavior when track skip limit is exceeded.(remove but not skip)

1.2.1
 - updated Ad interval from 450s to 900s (15 minutes)

1.2.2 (versionCode 6)
 - implemented thorough exception handling in HeadPlay -> playTrack method
 
1.3.0 (versionCode 7)
 - updated exception handling in HeadPlay -> playTrack method: check the current active play route name to avoid double playTrack
 - updated DMCA. extended DMCA logic to entire app (not a specific station)

1.3.1 (versionCode 8)
 - updated player logic
 - updated Ad interval to 3 minutes
 - solve the issue that in some devices, Control page is not working. (textShadowColor)
 - decreased Profile page station button text font size to prevent Add New button from being showing in 2 lines
 - fixed a possible issue in getting device advertising id
 - fixed a possible issue in getting uuid4 (added react-native-get-random-values and exception handling)
 - updated a DMCA interval to 3 hours 20 minutes and changed the logic a bit
 - changed AD type from preroll to midroll
 - changed the algorithm to get and analyze VAST and implemented impression call.

1.3.2 (versionCode 9)
 - fixed a typo on Register screen
 - increased AD_INTERVAL to 900
 - added timeout 5 seconds to axios get methods
 - added BackgroundTimer for axios background timeout
 - added refresh playback buttons for music and guestlistener page
 - made Done key press in Search field trigger search in CreateStation screen

1.4.0 (versionCode 10)
 - added broadcast toggler at the top of station list and upgrade message in music screen
