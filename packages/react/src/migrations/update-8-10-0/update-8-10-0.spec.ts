import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { readJsonInTree } from '@nrwl/workspace';
import * as path from 'path';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';

describe('Update 8-10-0', () => {
  let tree: Tree;
  let schematicRunner: SchematicTestRunner;

  beforeEach(async () => {
    tree = Tree.empty();
    tree = createEmptyWorkspace(tree);
    schematicRunner = new SchematicTestRunner(
      '@nrwl/react',
      path.join(__dirname, '../../../migrations.json')
    );
  });

  it(`should update libs`, async () => {
    tree.overwrite(
      'package.json',
      JSON.stringify({
        dependencies: {
          '@emotion/core': '10.0.23',
          '@emotion/styled': '10.0.23'
        },
        devDependencies: {
          '@types/react': '16.9.13'
        }
      })
    );

    tree = await schematicRunner
      .runSchematicAsync('update-8.10.0', {}, tree)
      .toPromise();

    const packageJson = readJsonInTree(tree, '/package.json');
    expect(packageJson).toMatchObject({
      dependencies: {
        '@emotion/core': '10.0.27',
        '@emotion/styled': '10.0.27'
      },
      devDependencies: {
        '@types/react': '16.9.17'
      }
    });
  });

  it('should add custom typings to react apps', async () => {
    const reactRunner = new SchematicTestRunner(
      '@nrwl/react',
      path.join(__dirname, '../../../collection.json')
    );
    tree = await reactRunner
      .runSchematicAsync('app', { name: 'demo' }, tree)
      .toPromise();
    tree = await reactRunner
      .runSchematicAsync(
        'app',
        { name: 'nested-app', directory: 'nested' },
        tree
      )
      .toPromise();

    tree = await schematicRunner
      .runSchematicAsync('update-8.10.0', {}, tree)
      .toPromise();

    let tsConfig = JSON.parse(tree.read(`apps/demo/tsconfig.json`).toString());
    expect(tsConfig.files).toContain(
      '../../node_modules/@nrwl/react/typings/svg.d.ts'
    );

    tsConfig = JSON.parse(
      tree.read(`apps/nested/nested-app/tsconfig.json`).toString()
    );
    expect(tsConfig.files).toContain(
      '../../../node_modules/@nrwl/react/typings/svg.d.ts'
    );
  });
});
