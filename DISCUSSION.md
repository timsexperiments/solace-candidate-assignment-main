Not sure the best way to use this... I'll go ahead and write down notes of what I'm doing on each step.

# 1. Understanding the problem / project

## Observations

- See tailwind config (also was mentioned in the web page)
  - I like my tailwind classes sorted, so adding prettier with the tailwind teams class sorting plugin
  - need to add prettier and prettier-plugin-tailwindcss as a dev dependency
  - testing this works by adding tailwind classes to replace some of the style tags
    - added `className="block m-6"` (`m-6` is `24px` which was added in the style tag) this was sorted to `className="m-6 block"` sorting works ✅
- Project runs without needing to start up the docker (Looks like database is not being used)

### Two main routs / pages

- / GET - Next Page (home page with advocate search)
  - this page has the main search
  - there are a few clear errors in the console and alerted by Next
    - > Hydration failed because the initial UI does not match what was rendered on the server.
      > In HTML, <th> cannot be a child of <thead>.
    - > Each child in a list should have a unique "key" prop.
      - There are 2 list `.maps` that I see on the `page.tsx`. We'll need to fix these
  - Code for this page is not well typed. My IDE is showing me a lot of squigglies
  - Search is filtering in memory on the FE. Let's make this come from the backend
  - Years of experience is a number but is using the includes
- /api/advocates GET - Next API route
  - route is giving hard-coded data

There is also a seed route, which seems to already be set up well for local testing. There should probably be a way

### Database stuff...

- .env file generally shouldn't be submitted (saw the environment variables are commented out. We can keep this)
  - creating a .env.local with the environment variables that can be used locally (saw that was already gitignored)
- migrations scripts already there (not 100% familiar with drizzle but the generate and migrate scripts worked by just running them via the npm script)
  - Migration script just didn't have environment variables. Newer versions of node have a `--env-file` flag that can be passed in. I think the order they are specified is the order that they are loaded in, and later values don't override the earlier ones. I specified that .env should be loaded first and then .env.local this way we could maybe use it in CI if we wanted to.
- Looking through schema, it probably makes sense to add some indexes to what we are going to search. Haven't decided how we want to search yet, so we'll come back later.
- JSONB column is untyped. I'm sure there is a way to do this with the ORM without having to assert the type
- I don't like the idea of mocking the DB in the `setup()` function. If I'm trying to use the DB and it's not working, I want to be informed by my stuff throwing errors instead of being confused to why it's not working.

## TODO

First we'll make the app work as it is expected to wrok:

- Fix `<th>` to be in a `<tr>` ✅
- Fix keys on the lists from the react page ✅
- Make types work!! ✅
- Fix `.includes` on number by casting it to a string first ✅
- Make data come from db ✅
- Remove DB mock in setup ✅
- Seed the DB with the SEED ✅

Next we can look into fixing other things (db indexing, filtering from the backend, make ui more reacty, etc...)

# 2. Planning

Now that we have things working as expected. We'll make a list of somethings that we want to see changed. Each feature listed should be able to have it's own standalone PR that we can merge in. These will be in prioritized order. These are in prioritized order based on the initial assingment (which can act as our requirements doc) and how I feel like I want to fix things as a secondary input.

- Fix filtering to not be on FE (can still be in memory for now if needed)
- Make the search experience feel more react like. (Prioritized due to mention in assignment doc)
- Minor improvements to make the experience more useable. (Prioritized due to mention in assignment doc)
- Move filtering through DB through maybe a FT search index or something (100,000 + advocates)
- Paginating (100,000 + advocates)
- Sorting on the search page (can be chosen only for certain columns if needed)
- Additional filters on the search page

I think that is all that we'll have time for, so let's go with those goals for now

# 3. DB filtering

**Goal**: Make filtering do the same thing it currently does but from the BE (preferably via SQL)

- Moving the filtering to the backend.
  - Need to add a search parameter to the BE to be able to pass the input value
- Struggled to get the yoe to convert to a string in postgres for some reason, so I timeboxed this to 5 minutes and decided to just make it an exact comparison since this is not likely how we will be filtering at the end of the project.
- in order to get the filtering working on each type, the easiest thing was to just introduce some state to track the input text, and run the existing effect on changes to the input text.

# 4. Reactify

**Goal**: use react apis to create a better experience and take advantage of react rendering patterns

I'm not that familiar with react as my experience leans mostly BE, but I can see a few improvments that could be made (some already previously made):

- Hold input in state (done in part 3)
- Move away from the query selector
- Make the api around searching advocates take advantage of custom hook `useAdvocateSearch` in order to make the behavior around the data fetching more reusable. It is possible that we would want to have a similar admin search page

# 5. Improve experience

**Goal**: Make the experience as usable as possible (timebox ~ 15 min, about ~1hr remaining)

Ideas:

- Mini design system
- Improve spacing
- Add error notifications for when the experience might have not worked as the user would expect
- fix buttons
- visual hierarchy

Had some extra time so added a feature to click on a specialty to search it specifically which I think just improves the experience.

The button and input are examples of a design system. I'd probably work on converting a general table that I could use in the design system as well, but didn't want to waste time on it for this project.

I know there are some libraries that are used for combining tailwind classes in JavaScript. I would probably use one of those libraries within my design system.

# 6. Full Text indexing

**Goal**: Make searching more efficient, closer to what I would want with a production app

- Add a ft index to the table
  - we want our index to filter like a search where each word in the search is separate (also we want to use a prefix search).
  - we will join each search term with an &
- use index in the BE filter

While making these changes, I noticed that the APIs must have changed, since the documentation didn't match. I updated the drizzle dependencies so that the docs would be more relevant instead of looking through the apis to figure out how it works.

As part of this change we also enhanced the seed to add over 1 million records to the DB in order to test the FT search capabilities.

# 7. Pagination

**Goal**: Allow users of the search to see more than the first 100 results.

There are a couple of different pagination schemes that we can go with:

1. a forward and back without page numbers or last page. This is commonly what Google uses in their searches

- pros:
  - keeps context of what the results were at the time the search was initiated ensuring that the results on future and previous pages always have the same results
- cons:
  - doesn't allow flexibility for skipping pages and stuff as easily (I'm sure we could build this, but more effort)

2. a simple pagination that just takes a page size and offset (page number)

- pros:
  - simple to implement we can do this in a few minutes
- cons:
  - pages are not guaranteed to be the same

I will go with opt. 2 for now because of the simplicity and time it takes to implement. This is often a common experience, so users will be used to this, even though it's not always the _best_ user experience. This solution is also fine when the data is not constantly updating. While I imagine a system like this would be adding in advocates every now and then, it would be uncommon that many advocates are getting added while users are actively searching. i.e. this is likely very read heavy data not write heavy.

- add simple pagination
- add page navigation to the table component
- update api to do pagination stuff

## Notes

- in the hook we try to setError with user friendly errors as these would likely be what we would alert the user with / display
- any console.log or console.error should represent sending to a logging service

**Observations:**

- Drizzle was actually really annoting to work with for the raw sql stuff due to the way it was sanitizing stuff. Eventually I figured it out. It is awesome that the sql function sanitizes the input. I had to play around with it for a while to understand how it works

# Things I'd change with more time

- Typically even for dev environment variables, I prefer to have a more secure place where engineers can pull the environment variables from for local dev. This could either put the variables directly in the environment or in a secure place where it can be copied and pasted from
  - I'd also use the env file for the docker-compose file as well rather than hardcoding the data. This would help it to be able to be adjusted to other environments as well without needing separate configs assuming that we are managing our own infrastructure.
- Make the seed route not deploy on non-local builds
- Add CI to build the project
- Add an error reporting / tracking and logging service to the BE and the FE
- use a design system for table and other common components

# Resources

## Commit 1

- Node --env-file stuff: https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs
- Add type to drizzle JSONB column https://orm.drizzle.team/docs/column-types/pg

## Commit 2

- Priorities and requirements https://findsolace.notion.site/Solace-Engineering-Assignment-bbf3ebf1fa274d0e92d9cde773a0a671

## Commit 6

- Drizzle full text index https://orm.drizzle.team/docs/guides/postgresql-full-text-search
- Postgres full text search to_tsvector https://www.postgresql.org/docs/current/textsearch.html
- Postgres full text search websearch query https://www.postgresql.org/docs/17/textsearch-controls.html
- Drizzle generated columns https://orm.drizzle.team/docs/guides/full-text-search-with-generated-columns

## Commit 7

- Postgres patition count https://stackoverflow.com/questions/28888375/run-a-query-with-a-limit-offset-and-also-get-the-total-number-of-rows
