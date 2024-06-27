Bugs:

- Upon opening the application and analyzing the console we see one warning to use createRoot because we're on React 18 and one error about the <svg> attribute height expected to be "auto". Changed from "auto" to "100%" to match pattern in Home.tsx svg reference.
- In App.tsx a ts error is shown "Expression produces a union type that is too complex to represent." This is telling us the structure could be simplified. After investigating further it seemed like noise and needed to make a new setting in settings.json for this project.
- The README states to use yarn and we have a package-lock, we can get rid of this as to follow the README properly.
- There is a UI bug on dashboard/investor that needed to be fixed and the data for the pie chart was backwards in relation to the tab.
- Improper folder structure, Onboarding was overly bloated and no separation of context/components/reducers.
- A name and email should be required and button should be disabled.
- A company name could be entered empty, the disabled function on the Button would not work, passing the wrong props.
- The add grants modal does not allow shares to be added, incorrect radix used (3).
- UI bug on dashboard not showing names and labels properly, added padding accordingly.
- A bad test for looking for text on pie chart, I added a testid to properly account for what is on the pie chart.
- I added a check to whether or not to show the pie chart -- bad UI otherwise.
- Unnecessary /company call on Shareholder.tsx
- Added default date to today when issuing new grants.
- Added a generic type for Shareholder and Grant since they had similar structure, made typing cleaner.
- Added error catching and success checking in queries and mutations and in general more try/catches.
- Added navigation back to company page if there is no name. Someone would have to manually set the URL to get this behavior but there was a todo.
- Added a back button in shareholder view as it seemed wrong without it. Also considered a "signout" button but didn't seem necessary.
- On Dashboard I put submitNewShareholder inside a useCallback as it relies on a state variable. Also added a try/catch and an error thrown if it's a bad mutation. Also did this with submitGrant in Shareholder.tsx
- Turn off refetch on refocus, no need and causes too many calls.
- Took out all of the backend calls from the useEffect in DoneStep.tsx. Too bulky and could cause potential problems if two renders were to happen.
- Shareholder page needed some padding to show equity/grants etc.

Considerations:

- Email format validation - usually done on backend i.e. some sort of regex or library.
- Separate Shareholder out component - probably warranted but kept as is.
- No signout button? Was able to confirm signed in worked with manually deleting session and using tests.
- Probaby could've cut down on calls when switching between pages. Use of localStorage as caching could've been possible, probabyl overkill for most situations but a heavy trafficked site it could make all the difference.
- Some tests fail randomly, you may need to re-run
- Thought about removing refetch on refocus to cut down on api calls, worth discussing.
