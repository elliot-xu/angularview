import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { AstParser } from '../../ast-parser';

suite('ast-parser Test Suite', () => {
	vscode.window.showInformationMessage('Start ast-parser test suite.');

	const parser = new AstParser();

	test('test basic component', () => {
		const component_content = 
`import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'my-hackernews';
}`;
		let metaData = parser.extract('app.component.ts', component_content);
		assert.strictEqual(metaData?.selector, 'app-root');
		assert.strictEqual(metaData?.templateUrl, './app.component.html');
		assert.deepStrictEqual(metaData?.styleUrls, ['./app.component.css']);
	});

	test('test component without styleUrls', () => {
		const component_content = 
`import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'my-hackernews';
}`;
		let metaData = parser.extract('app.component.ts', component_content);
		assert.strictEqual(metaData?.selector, 'app-root');
		assert.strictEqual(metaData?.templateUrl, './app.component.html');
		assert.strictEqual(metaData?.styleUrls, undefined);
	});

	test('test component only has selector', () => {
		const component_content = 
`import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  template: ''
})
export class AppComponent {
  title = 'my-hackernews';
}`;
		let metaData = parser.extract('app.component.ts', component_content);
		assert.strictEqual(metaData?.selector, 'app-root');
		assert.strictEqual(metaData?.templateUrl, undefined);
		assert.strictEqual(metaData?.styleUrls, undefined);
	});

	test('test non-component', () => {
		const module_content = 
`
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }`;
		let metaData = parser.extract('app.module.ts', module_content);
		assert.strictEqual(metaData, undefined);
	});
});