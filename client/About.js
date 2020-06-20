import React from 'react'
import { Link } from 'react-router-dom'
import css from '@unrest/css'

const CTC = (
  <a href="https://www.youtube.com/channel/UCC-UOdK8-mIjxBQm_ot1T-Q">
    Cracking the Cryptic
  </a>
)

function Description() {
  return (
    <section>
      <h2>About</h2>
      <p>
        {`Crurently this is just a fan-made app for ${CTC}. `}I wanted to add
        some features to the site and thought it'd be fun to make a sudoku app
        so here it is. Eventually I would like to add more puzzle sources and in
        interface for users to submit custom puzzles and open source the code.
        If you have any questions or comments feel free to{' '}
        <a href="https://discord.com/channels/@me/106132473447993344">
          contact me on the discord
        </a>
        .
      </p>
    </section>
  )
}

function Differences() {
  return (
    <section>
      <h2>Differences between this and Cracking the Cryptic</h2>
      <h3>Appearance</h3>
      <ul className="browser-default">
        <li>
          <Link to="/help/parity/">Parity Mode</Link>
        </li>
        <li>Victory animations</li>
        <li>
          Interface customization (<i className={css.icon('gear')} /> in nav)
        </li>
        <li>Dark mode</li>
        <li>Larger play area</li>
      </ul>
      <h3>Keys</h3>
      <ul className="browser-default">
        <li>
          <code>ctrl + shift + 0-9</code> sets the square color
        </li>
        <li>
          <code>ctrl + click</code> can deselect squares
        </li>
        <li>
          <code>o, e q, and w</code> set parity of squares
        </li>
      </ul>
      <h3>Interface</h3>
      <ul className="browser-default">
        <li>List of puzzles</li>
        <li>Link to video / video description on puzzle</li>
        <li>Replay game</li>
        <li>Additional rule checkers (more coming soon!)</li>
        <li>
          Persistant state (refresh doesn't wipe puzzle, puzzles marked as
          solved)
        </li>
        <li>Portrait / Landscape mode (rezise browser to see)</li>
      </ul>
      <h3>What's missing?</h3>
      <ul className="browser-default">
        <li>
          Many puzzles don't properly render. Currently I've just hidden these.
        </li>
        <li>Non-sudoku and non-CTC puzzles aren't in app</li>
      </ul>
    </section>
  )
}

function ComingSoon() {
  return (
    <section>
      <h2>What's next?</h2>
      <ul className="browser-default">
        <li>Checkers for exotic rules</li>
        <li>Fix rendering on non-9x9 puzzles and fix other broken puzzles</li>
        <li>User puzzle submission interface</li>
        <li>Import from non-CTC sources (please recommend some to me!)</li>
      </ul>
    </section>
  )
}

function Links() {
  return (
    <section>
      <h2>Credits</h2>
      <ul className="browser-default">
        <li>
          {'Puzzles taken from the YouTube Channel '}
          {CTC}
        </li>
        <li>
          <a href="https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces">
            Chess Icons taken from wikipedia
          </a>
        </li>
        <li>
          {'Additional icons made by '}
          <a href="https://www.flaticon.com/authors/freepik" title="Freepik">
            Freepik
          </a>
          {' from '}
          <a href="https://www.flaticon.com/" title="Flaticon">
            www.flaticon.com
          </a>
        </li>
        <li>
          {'Source code hosted at '}
          <a href="https://github.com/chriscauley/sudoku/">
            github.com/chrsicauley/sudoku/
          </a>
        </li>
      </ul>
    </section>
  )
}

export default function About() {
  return (
    <div className="About">
      <Description />
      <Differences />
      <ComingSoon />
      <Links />
    </div>
  )
}
